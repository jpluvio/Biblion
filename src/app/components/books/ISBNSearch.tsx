'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchBookByISBN, BookSearchResult } from '@/app/actions/external';
import { checkIsbnExists } from '@/app/actions/books';
import { useToast } from '../ui/ToastProvider';
import BarcodeScanner from './BarcodeScanner';

interface ISBNSearchProps {
    onBookFound: (book: BookSearchResult) => void;
}

export default function ISBNSearch({ onBookFound }: ISBNSearchProps) {
    const [isbn, setIsbn] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const router = useRouter();

    const handleScan = (decodedText: string) => {
        setIsbn(decodedText);
        // Trigger search immediately
        handleSearch(undefined, decodedText);
    };

    const handleSearch = async (e?: React.FormEvent, overrideIsbn?: string) => {
        if (e) e.preventDefault();

        const searchIsbn = overrideIsbn || isbn;
        if (!searchIsbn.trim()) return;

        setIsLoading(true);
        try {
            // Check if book already exists locally
            const localCheck = await checkIsbnExists(searchIsbn);
            if (localCheck.exists && localCheck.bookId) {
                addToast(`Book already in library: ${localCheck.title || searchIsbn}. Redirecting...`, 'info');
                router.push(`/books/${localCheck.bookId}`);
                setIsLoading(false);
                return;
            }

            const res = await searchBookByISBN(searchIsbn);

            if (res.success && res.data) {
                addToast('Book found!', 'success');
                onBookFound(res.data);
                if (!overrideIsbn) setIsbn(''); // Clear input only if manual
            } else {
                addToast(res.error || 'Book not found', 'error');
            }
        } catch (error) {
            addToast('An error occurred during search', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="Enter ISBN or Scan..."
                        className="w-full pl-3 pr-10 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isLoading || !isbn.trim()}
                    className="inline-flex justify-center items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                </button>
            </div>

            <BarcodeScanner onScanSuccess={handleScan} />
        </div>
    );
}
