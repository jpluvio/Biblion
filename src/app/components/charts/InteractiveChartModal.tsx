'use client';

import { useEffect, useState } from 'react';
import { getBooksByIds } from '@/app/actions/books';
import { X, Book as BookIcon } from 'lucide-react';
import Link from 'next/link';
import { BookWithRelations } from '@/types/types';

interface InteractiveChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    bookIds: string[];
}

export default function InteractiveChartModal({ isOpen, onClose, title, bookIds }: InteractiveChartModalProps) {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && bookIds.length > 0) {
            setLoading(true);
            getBooksByIds(bookIds).then((res) => {
                if (res.success && res.books) {
                    setBooks(res.books);
                }
                setLoading(false);
            });
        }
    }, [isOpen, bookIds]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-stone-100">
                    <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                        <BookIcon className="w-5 h-5 text-indigo-500" />
                        {title} <span className="text-stone-400 text-sm font-normal">({bookIds.length} books)</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-10 text-stone-500">
                            No books found for this segment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {books.map((book) => (
                                <Link
                                    key={book.id}
                                    href={`/books/${book.id}`}
                                    className="flex gap-4 p-3 bg-white rounded-lg border border-stone-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                                >
                                    {book.coverImage ? (
                                        <div className="w-12 h-16 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-16 bg-indigo-50 rounded shrink-0 flex items-center justify-center text-indigo-200 shadow-sm">
                                            <BookIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="flex-col overflow-hidden">
                                        <h3 className="font-semibold text-stone-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                            {book.title}
                                        </h3>
                                        <p className="text-stone-500 text-xs truncate">
                                            {book.author?.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
