'use client';

import { addBook } from '@/app/actions/books';
import { BookSearchResult } from '@/app/actions/external';
import { useRef, useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import ISBNSearch from './books/ISBNSearch';
import CoverManager from './books/CoverManager';
import { useToast } from './ui/ToastProvider';
import CategoryPicker from './categories/CategoryPicker';
import { CategoryWithChildren } from '@/app/actions/categories';
import { LocationWithChildren } from '@/app/actions/locations';
import TagInput from './ui/TagInput';

interface AddBookFormProps {
    onSuccess?: () => void;
    allCategories: CategoryWithChildren[];
    allLocations: LocationWithChildren[];
    allUsers: any[];
}

export default function AddBookForm({ onSuccess, allCategories, allLocations, allUsers }: AddBookFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [publishYear, setPublishYear] = useState<string | number>('');
    const [pages, setPages] = useState<string | number>('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<CategoryWithChildren[]>([]);
    const [language, setLanguage] = useState('');
    const [publisher, setPublisher] = useState('');
    const [initialStatus, setInitialStatus] = useState('To read');
    const [locationId, setLocationId] = useState('');

    // UI Standardization: Owner as Tags, + New Tags field
    const [owner, setOwner] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const handleBookFound = (book: BookSearchResult) => {
        setTitle(book.title || '');
        setAuthor(book.author || '');
        setIsbn(book.isbn || '');
        setPublishYear(book.publishYear || '');
        setPages(book.pages || '');
        setDescription(book.description || '');
        setCoverImage(book.coverImage || '');
        setLanguage(book.language || '');
        setPublisher(book.publisher || '');

        if (book.coverImage) {
            addToast('Cover image found!', 'success');
        } else {
            addToast('No cover image found for this ISBN.', 'info');
        }
    };

    async function action(formData: FormData) {
        setIsSubmitting(true);
        try {
            // Append categories JSON manually since we control the input
            // But we actually use a hidden input in CategoryPicker which binds to 'categories' name
            // So formData should already contain it. However, let's verify logic.
            // CategoryPicker puts <input name="categories" value={JSON...} />
            // So formData.get('categories') will be the JSON string. Perfect.

            const res = await addBook(formData);
            if (res?.success) {
                formRef.current?.reset();
                addToast('Book added successfully', 'success');
                // Reset state
                setTitle('');
                setAuthor('');
                setIsbn('');
                setPublishYear('');
                setPages('');
                setDescription('');
                setCoverImage('');
                setOwner([]);
                setTags([]);
                setSelectedCategories([]);
                setLanguage('');
                setPublisher('');
                setInitialStatus('To read');
                setLocationId('');

                if (onSuccess) onSuccess();
            } else {
                addToast(res?.error || 'Error adding book', 'error');
            }
        } catch (error) {
            addToast('An unexpected error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    }

    const renderLocationOptions = (locations: LocationWithChildren[], depth = 0): React.ReactNode[] => {
        return locations.flatMap((location) => {
            const prefix = '—'.repeat(depth);
            const option = (
                <option key={location.id} value={location.id}>
                    {prefix ? `${prefix} ` : ''}{location.name}
                </option>
            );
            const children = location.children ? renderLocationOptions(location.children, depth + 1) : [];
            return [option, ...children];
        });
    };

    return (
        <div className="w-full">
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
                <label className="block text-sm font-semibold mb-2">Auto-fill details</label>
                <ISBNSearch onBookFound={handleBookFound} />
            </div>

            <form ref={formRef} action={action} className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-6">

                {/* Cover Image Section */}
                <div className="lg:col-span-3 space-y-4">
                    <label className="block text-sm font-medium">Cover Image</label>
                    <CoverManager
                        currentCover={coverImage}
                        onCoverChange={setCoverImage}
                    />
                    <input type="hidden" name="coverImage" value={coverImage} />
                </div>

                {/* Main Fields Section */}
                <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label htmlFor="isbn" className="block text-sm font-medium mb-1">ISBN</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="isbn"
                            id="isbn"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input font-mono"
                            placeholder="e.g. 9781234567890"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="author" className="block text-sm font-medium mb-1">Author</label>
                        <input
                            type="text"
                            name="author"
                            id="author"
                            required
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="language" className="block text-sm font-medium mb-1">Language</label>
                        <input
                            type="text"
                            name="language"
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                            placeholder="e.g. English"
                        />
                    </div>

                    <div>
                        <label htmlFor="publisher" className="block text-sm font-medium mb-1">Publisher</label>
                        <input
                            type="text"
                            name="publisher"
                            id="publisher"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                            placeholder="e.g. Penguin Books"
                        />
                    </div>

                    <div>
                        <label htmlFor="publishYear" className="block text-sm font-medium mb-1">Publishing Year</label>
                        <input
                            type="number"
                            name="publishYear"
                            id="publishYear"
                            value={publishYear}
                            onChange={(e) => setPublishYear(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                            placeholder="e.g. 2023"
                        />
                    </div>

                    <div>
                        <label htmlFor="pages" className="block text-sm font-medium mb-1">Pages</label>
                        <input
                            type="number"
                            name="pages"
                            id="pages"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Categories</label>
                        <CategoryPicker
                            selectedCategories={selectedCategories}
                            allCategories={allCategories}
                            onChange={setSelectedCategories}
                            placeholder="Select or create category..."
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Physical Location</label>
                        <select
                            name="locationId"
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input text-sm"
                        >
                            <option value="">-- No Location Assigned --</option>
                            {renderLocationOptions(allLocations)}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">E.g., Living Room &gt; Billy &gt; Shelf 3</p>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Owner</label>
                        <TagInput
                            value={owner}
                            onChange={(val) => setOwner(val)}
                            placeholder="Who owns this copy?"
                            maxTags={1}
                            suggestions={allUsers.map(u => u.name || u.email)}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">Tags</label>
                        <TagInput
                            value={tags}
                            onChange={(val) => setTags(val)}
                            placeholder="Add tags (e.g. favorite, wishlist)..."
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="initialStatus" className="block text-sm font-medium mb-1">Reading Status</label>
                        <select
                            name="initialStatus"
                            id="initialStatus"
                            value={initialStatus}
                            onChange={(e) => setInitialStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input text-sm"
                        >
                            <option value="To read">To read</option>
                            <option value="To study">To study</option>
                            <option value="Reading">Reading</option>
                            <option value="Studying">Studying</option>
                            <option value="Read">Read</option>
                            <option value="Paused">Paused</option>
                            <option value="Dropped">Dropped</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-input"
                        />
                    </div>
                </div>

                <div className="md:col-span-12">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition shadow-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                        Add Book
                    </button>
                </div>
            </form>
        </div>
    );
}
