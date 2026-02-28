'use server';

interface GoogleBooksVolume {
    volumeInfo: {
        title: string;
        authors?: string[];
        publisher?: string;
        publishedDate?: string;
        pageCount?: number;
        description?: string;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        industryIdentifiers?: {
            type: string;
            identifier: string;
        }[];
        language?: string;
    }
}

export type BookSearchResult = {
    title: string;
    author: string;
    isbn: string;
    publisher?: string;
    publishYear?: number;
    pages?: number;
    description?: string;
    coverImage?: string;
    language?: string;
};

export async function searchBookByISBN(isbn: string): Promise<{ success: boolean; data?: BookSearchResult; error?: string }> {
    try {
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
        if (!cleanIsbn) return { success: false, error: 'Invalid ISBN' };

        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);

        if (!res.ok) {
            console.warn(`Google Books API warning: ${res.status} ${res.statusText}. Falling back to Open Library...`);
            return await searchOpenLibrary(isbn);
        }

        const data = await res.json();

        if (!data.items || data.items.length === 0) {
            return await searchOpenLibrary(isbn);
        }

        const volume = data.items[0] as GoogleBooksVolume;
        const info = volume.volumeInfo;

        const coverImage = info.imageLinks?.thumbnail?.replace('http:', 'https:').replace('&edge=curl', '');

        // If Google Books result has no cover, try Open Library to see if it has one
        if (!coverImage) {
            const olResult = await searchOpenLibrary(isbn);
            if (olResult.success && olResult.data?.coverImage) {
                // If Open Library has a cover, allow merging or preferring Open Library result
                // For simplicity, if Google missing cover but OL has it, we can return OL result
                // or just take the cover. Let's return OL result if it has cover, as it might be better data overall in this case.
                return olResult;
            }
        }

        const result: BookSearchResult = {
            title: info.title,
            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
            isbn: cleanIsbn,
            publisher: info.publisher,
            publishYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined,
            pages: info.pageCount,
            description: info.description,
            coverImage: coverImage,
            language: info.language,
        };

        return { success: true, data: result };

    } catch (error: any) {
        console.error('Google Books API failed:', error);
        // Fallback to Open Library
        return await searchOpenLibrary(isbn);
    }
}

async function searchOpenLibrary(isbn: string): Promise<{ success: boolean; data?: BookSearchResult; error?: string }> {
    try {
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
        const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`);

        if (!res.ok) {
            return { success: false, error: `Open Library API error: ${res.statusText}` };
        }

        const data = await res.json();
        const bookData = data[`ISBN:${cleanIsbn}`];

        if (!bookData) {
            return { success: false, error: 'Book not found in Open Library' };
        }

        const result: BookSearchResult = {
            title: bookData.title,
            author: bookData.authors ? bookData.authors.map((a: any) => a.name).join(', ') : 'Unknown Author',
            isbn: cleanIsbn,
            publisher: bookData.publishers ? bookData.publishers.map((p: any) => p.name).join(', ') : undefined,
            publishYear: bookData.publish_date ? parseInt(bookData.publish_date.match(/\d{4}/)?.[0] || '0') : undefined,
            pages: bookData.number_of_pages,
            description: bookData.description || undefined,
            coverImage: bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small,
            language: undefined,
        };

        return { success: true, data: result };

    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to search book in Open Library' };
    }
}
