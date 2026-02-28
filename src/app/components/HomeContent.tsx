'use client';

import { BookWithRelations } from '@/types/types';
import AddBookForm from './AddBookForm';
import BookList from './BookList';
import BookSuggestion from './suggestions/BookSuggestion';
import LibraryFilterBar from './LibraryFilterBar';
import Modal from './ui/Modal';
import { useState, Suspense } from 'react';
import { Plus, LayoutGrid, List, CheckSquare } from 'lucide-react';
import SearchBar from './SearchBar';

import { CategoryWithChildren } from '@/app/actions/categories';
import { LocationWithChildren } from '@/app/actions/locations';
import { bulkDeleteBooks, bulkUpdateCategory, bulkUpdateReadingStatus, bulkUpdateLocation } from '@/app/actions/books';
import BulkActionBar from './BulkActionBar';

interface HomeContentProps {
    initialBooks: BookWithRelations[];
    allCategories: CategoryWithChildren[];
    allLocations: LocationWithChildren[];
    allUsers: any[]; // Using any for simplicity as User type might be complex with relations, but we select specifics
}

export default function HomeContent({ initialBooks, allCategories, allLocations, allUsers }: HomeContentProps) {
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const [categoryPath, setCategoryPath] = useState<typeof allCategories>(allCategories);
    const [categoryBreadcrumbs, setCategoryBreadcrumbs] = useState<{ id: string; name: string; children: typeof allCategories }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

    const [locationPath, setLocationPath] = useState<typeof allLocations>(allLocations);
    const [locationBreadcrumbs, setLocationBreadcrumbs] = useState<{ id: string; name: string; children: typeof allLocations }[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [selectedLocationName, setSelectedLocationName] = useState<string>('');

    // ... (rest of state and handlers)

    const handleBookAdded = () => {
        setIsAddBookModalOpen(false);
    };

    return (
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0 pb-24">
                <BookSuggestion />

                <div className="rounded-xl mt-8">
                    {/* Mobile Search - Visible only on mobile screens */}
                    <div className="block md:hidden mb-4 border-b border-stone-200 pb-4">
                        <Suspense>
                            <SearchBar />
                        </Suspense>
                    </div>

                    {/* ... header ... */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <h2 className="text-2xl font-bold text-stone-800">Your Library</h2>
                            <span className="text-sm text-stone-500 font-medium bg-stone-100 px-3 py-1 rounded-full">
                                {initialBooks.length} books
                            </span>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsAddBookModalOpen(true)}
                                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Add Book</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectionMode(!selectionMode);
                                        if (selectionMode) setSelectedIds([]);
                                    }}
                                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all ${selectionMode
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                                        }`}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    <span className="font-medium text-sm">{selectionMode ? 'Done' : 'Select'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200 w-full sm:w-auto justify-center sm:justify-start">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                    ? 'bg-white shadow-sm text-stone-800'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                                aria-label="Grid view"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                    ? 'bg-white shadow-sm text-stone-800'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                                aria-label="List view"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <LibraryFilterBar categories={allCategories} locations={allLocations} />

                    <BookList
                        books={initialBooks}
                        viewMode={viewMode}
                        selectedIds={selectionMode ? selectedIds : undefined}
                        onSelectionChange={selectionMode ? (id, isSelected) => {
                            if (isSelected) {
                                setSelectedIds(prev => [...prev, id]);
                            } else {
                                setSelectedIds(prev => prev.filter(i => i !== id));
                            }
                        } : undefined}
                    />
                </div>
            </div>

            {/* Floating Action Button Removed */}

            {/* Add Book Modal */}
            <Modal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                title="Add New Book"
            >
                <AddBookForm onSuccess={handleBookAdded} allCategories={allCategories} allLocations={allLocations} allUsers={allUsers} />
            </Modal>

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds([])}
                isProcessing={isProcessingBulk}
                onChangeCategory={() => setIsCategoryModalOpen(true)}
                onChangeLocation={() => setIsLocationModalOpen(true)}
                onChangeStatus={() => setIsStatusModalOpen(true)}
                onDelete={async (ids) => {
                    setIsProcessingBulk(true);
                    await bulkDeleteBooks(ids);
                    setSelectedIds([]);
                    setIsProcessingBulk(false);
                }}
            />

            {/* Bulk Category Modal */}
            <Modal isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setCategoryPath(allCategories); setCategoryBreadcrumbs([]); setSelectedCategoryId(null); }} title="Assign Category">
                <div className="p-4 flex flex-col gap-4">
                    <p className="text-sm text-stone-600">Navigate and select a category:</p>

                    {/* Breadcrumb trail */}
                    {categoryBreadcrumbs.length > 0 && (
                        <div className="flex items-center gap-1 text-sm flex-wrap">
                            <button
                                onClick={() => { setCategoryPath(allCategories); setCategoryBreadcrumbs([]); setSelectedCategoryId(null); setSelectedCategoryName(''); }}
                                className="text-indigo-600 hover:underline"
                            >
                                All
                            </button>
                            {categoryBreadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    <span className="text-stone-400">/</span>
                                    <button
                                        onClick={() => {
                                            setCategoryPath(crumb.children);
                                            setCategoryBreadcrumbs(prev => prev.slice(0, i + 1));
                                            setSelectedCategoryId(crumb.id);
                                            setSelectedCategoryName(crumb.name);
                                        }}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        {crumb.name}
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                        {categoryPath.map(cat => {
                            const hasChildren = cat.children && cat.children.length > 0;
                            const isSelected = selectedCategoryId === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        if (hasChildren) {
                                            setCategoryBreadcrumbs(prev => [...prev, { id: cat.id, name: cat.name, children: cat.children! }]);
                                            setCategoryPath(cat.children!);
                                            setSelectedCategoryId(cat.id);
                                            setSelectedCategoryName(cat.name);
                                        } else {
                                            setSelectedCategoryId(cat.id);
                                            setSelectedCategoryName(cat.name);
                                        }
                                    }}
                                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${isSelected
                                        ? 'bg-indigo-100 border-indigo-300 border ring-1 ring-indigo-200'
                                        : 'border border-stone-200 hover:bg-stone-50'
                                        }`}
                                >
                                    <span>{cat.name}</span>
                                    {hasChildren && <span className="text-stone-400 text-sm">▸</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Confirm button */}
                    {selectedCategoryId && (
                        <button
                            onClick={async () => {
                                setIsProcessingBulk(true);
                                await bulkUpdateCategory(selectedIds, selectedCategoryId);
                                setIsCategoryModalOpen(false);
                                setSelectedIds([]);
                                setIsProcessingBulk(false);
                                setCategoryPath(allCategories);
                                setCategoryBreadcrumbs([]);
                                setSelectedCategoryId(null);
                            }}
                            disabled={isProcessingBulk}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            {isProcessingBulk ? 'Assigning...' : `Assign to "${selectedCategoryName}"`}
                        </button>
                    )}
                </div>
            </Modal>

            {/* Bulk Status Modal */}
            <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Update Reading Status">
                <div className="p-4 flex flex-col gap-4">
                    <p className="text-sm text-stone-600">Set reading status for all selected books:</p>
                    <div className="flex flex-col gap-2">
                        {['To read', 'To study', 'Reading', 'Studying', 'Read', 'Paused', 'Dropped'].map(status => (
                            <button
                                key={status}
                                onClick={async () => {
                                    setIsProcessingBulk(true);
                                    await bulkUpdateReadingStatus(selectedIds, status);
                                    setIsStatusModalOpen(false);
                                    setSelectedIds([]);
                                    setIsProcessingBulk(false);
                                }}
                                className="text-left px-3 py-2 border rounded-md hover:bg-stone-50 font-medium"
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Bulk Location Modal */}
            <Modal isOpen={isLocationModalOpen} onClose={() => { setIsLocationModalOpen(false); setLocationPath(allLocations); setLocationBreadcrumbs([]); setSelectedLocationId(null); setSelectedLocationName(''); }} title="Assign Physical Location">
                <div className="p-4 flex flex-col gap-4">
                    <p className="text-sm text-stone-600">Navigate and select a physical location:</p>

                    {/* Breadcrumb trail */}
                    {locationBreadcrumbs.length > 0 && (
                        <div className="flex items-center gap-1 text-sm flex-wrap">
                            <button
                                onClick={() => { setLocationPath(allLocations); setLocationBreadcrumbs([]); setSelectedLocationId(null); setSelectedLocationName(''); }}
                                className="text-indigo-600 hover:underline"
                            >
                                Root
                            </button>
                            {locationBreadcrumbs.map((crumb, i) => (
                                <span key={i} className="flex items-center gap-1">
                                    <span className="text-stone-400">/</span>
                                    <button
                                        onClick={() => {
                                            setLocationPath(crumb.children);
                                            setLocationBreadcrumbs(prev => prev.slice(0, i + 1));
                                            setSelectedLocationId(crumb.id);
                                            setSelectedLocationName(crumb.name);
                                        }}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        {crumb.name}
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                        <button
                            onClick={() => {
                                setSelectedLocationId('none');
                                setSelectedLocationName('No Location');
                            }}
                            className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${selectedLocationId === 'none'
                                ? 'bg-indigo-100 border-indigo-300 border ring-1 ring-indigo-200'
                                : 'border border-stone-200 hover:bg-stone-50'
                                }`}
                        >
                            <span className="italic text-stone-500">-- Remove Location --</span>
                        </button>

                        {locationPath.map(loc => {
                            const hasChildren = loc.children && loc.children.length > 0;
                            const isSelected = selectedLocationId === loc.id;
                            return (
                                <button
                                    key={loc.id}
                                    onClick={() => {
                                        if (hasChildren) {
                                            setLocationBreadcrumbs(prev => [...prev, { id: loc.id, name: loc.name, children: loc.children! }]);
                                            setLocationPath(loc.children!);
                                            setSelectedLocationId(loc.id);
                                            setSelectedLocationName(loc.name);
                                        } else {
                                            setSelectedLocationId(loc.id);
                                            setSelectedLocationName(loc.name);
                                        }
                                    }}
                                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${isSelected
                                        ? 'bg-indigo-100 border-indigo-300 border ring-1 ring-indigo-200'
                                        : 'border border-stone-200 hover:bg-stone-50'
                                        }`}
                                >
                                    <span>{loc.name}</span>
                                    {hasChildren && <span className="text-stone-400 text-sm">▸</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Confirm button */}
                    {selectedLocationId && (
                        <button
                            onClick={async () => {
                                setIsProcessingBulk(true);
                                await bulkUpdateLocation(selectedIds, selectedLocationId === 'none' ? null : selectedLocationId);
                                setIsLocationModalOpen(false);
                                setSelectedIds([]);
                                setIsProcessingBulk(false);
                                setLocationPath(allLocations);
                                setLocationBreadcrumbs([]);
                                setSelectedLocationId(null);
                                setSelectedLocationName('');
                            }}
                            disabled={isProcessingBulk}
                            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            {isProcessingBulk ? 'Assigning...' : `Assign to "${selectedLocationName}"`}
                        </button>
                    )}
                </div>
            </Modal>
        </main>
    );
}
