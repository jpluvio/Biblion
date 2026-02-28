'use client';

import { updateBook, deleteBook } from '@/app/actions/books';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { BookWithRelations } from '@/types/types';
import CategoryPicker from './categories/CategoryPicker';
import { CategoryWithChildren } from '@/app/actions/categories';
import { LocationWithChildren } from '@/app/actions/locations';
import TagInput from './ui/TagInput';
import CoverManager from './books/CoverManager';
import ConfirmDialog, { useConfirmDialog } from './ui/ConfirmDialog';

export default function EditBookForm({ book, allCategories, allLocations, allUsers }: { book: BookWithRelations, allCategories: CategoryWithChildren[], allLocations: LocationWithChildren[], allUsers: any[] }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [coverImage, setCoverImage] = useState(book.coverImage || '');
    const { confirm: confirmDelete, dialogProps } = useConfirmDialog();

    // Convert book.categories (which might be simple objects) to CategoryWithChildren structure
    // Since we only need id, name, icon, color mostly for the picker, we can map it.
    // However, book.categories from BookWithRelations might not have 'children' or '_count'.
    // We cast it partly.
    const [selectedCategories, setSelectedCategories] = useState<CategoryWithChildren[]>(
        (book.categories || []).map(c => ({
            ...c,
            children: [],
            _count: { books: 0 },
            icon: (c as any).icon // Cast because BookWithRelations type might be slightly outdated on client vs server
        } as CategoryWithChildren))
    );

    const [owner, setOwner] = useState<string[]>(book.owner ? [book.owner] : []);
    // Ensure book type has tags, or default empty. BookWithRelations might not have tags yet if I didn't update the type definition or fetching query. 
    // Assuming tags are fetched. If not, this might default to empty.
    const [tags, setTags] = useState<string[]>((book as any).tags?.map((t: any) => t.name) || []);
    const [locationId, setLocationId] = useState<string>((book as any).locationId || '');

    async function action(formData: FormData) {
        setIsSaving(true);
        // Manual handling if inputs don't sync well?
        // TagInput puts <input type="hidden" ... /> so formData has it.
        const res = await updateBook(book.id, formData);
        setIsSaving(false);

        if (res?.success) {
            router.push(`/books/${book.id}`);
            router.refresh();
        } else {
            alert('Error updating book');
        }
    }

    async function handleDelete() {
        const confirmed = await confirmDelete({
            title: 'Delete Book',
            message: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!confirmed) return;

        setIsDeleting(true);
        const res = await deleteBook(book.id);
        setIsDeleting(false);

        if (res?.success) {
            router.push('/');
            router.refresh();
        } else {
            alert('Error deleting book');
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
        <>
            <form action={action} className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-6">
                        <div className="lg:col-span-3 space-y-4">
                            <label className="block text-sm font-medium">Cover Image</label>
                            <CoverManager
                                currentCover={coverImage}
                                onCoverChange={setCoverImage}
                            />
                            <input type="hidden" name="coverImage" value={coverImage} />
                        </div>

                        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                <div className="mt-1">
                                    <input type="text" name="title" id="title" defaultValue={book.title} required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author</label>
                                <div className="mt-1">
                                    <input type="text" name="author" id="author" defaultValue={book.author.name} required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">ISBN</label>
                                <div className="mt-1">
                                    <input type="text" inputMode="numeric" pattern="[0-9]*" name="isbn" id="isbn" defaultValue={book.isbn || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                                <div className="mt-1">
                                    <input type="text" name="language" id="language" defaultValue={book.language || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">Publisher</label>
                                <div className="mt-1">
                                    <input type="text" name="publisher" id="publisher" defaultValue={(book as any).publisher || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="e.g. Penguin Books" />
                                </div>
                            </div>

                            <div className="sm:col-span-1">
                                <label htmlFor="publishYear" className="block text-sm font-medium text-gray-700">Year</label>
                                <div className="mt-1">
                                    <input type="number" name="publishYear" id="publishYear" defaultValue={book.publishYear || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>

                            <div className="sm:col-span-1">
                                <label htmlFor="pages" className="block text-sm font-medium text-gray-700">Pages</label>
                                <div className="mt-1">
                                    <input type="number" name="pages" id="pages" defaultValue={book.pages || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Owner Copy</label>
                                <div className="mt-1">
                                    <TagInput
                                        value={owner}
                                        onChange={setOwner}
                                        placeholder="Who owns this copy?"
                                        maxTags={1}
                                        suggestions={allUsers.map(u => u.name || u.email)}
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Tags</label>
                                <div className="mt-1">
                                    <TagInput
                                        value={tags}
                                        onChange={setTags}
                                        placeholder="Add tags..."
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Categories</label>
                                <div className="mt-1">
                                    <CategoryPicker
                                        selectedCategories={selectedCategories}
                                        allCategories={allCategories}
                                        onChange={setSelectedCategories}
                                        placeholder="Select or create category..."
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                                <div className="mt-1">
                                    <select
                                        name="locationId"
                                        value={locationId}
                                        onChange={(e) => setLocationId(e.target.value)}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    >
                                        <option value="">-- No Location Assigned --</option>
                                        {renderLocationOptions(allLocations)}
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <div className="mt-1">
                                    <textarea id="description" name="description" rows={4} defaultValue={book.description || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete Book'}
                    </button>

                    <div className="flex gap-3">
                        <Link href={`/books/${book.id}`} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Link>
                        <button type="submit" disabled={isSaving || isDeleting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>

            <ConfirmDialog {...dialogProps} />
        </>
    );
}
