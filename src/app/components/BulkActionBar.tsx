'use client';

import { Trash2, Tag, BookOpen, X, MapPin } from 'lucide-react';
import { useState } from 'react';

interface BulkActionBarProps {
    selectedIds: string[];
    onClearSelection: () => void;
    onDelete: (ids: string[]) => void;
    onChangeCategory: (ids: string[]) => void;
    onChangeStatus: (ids: string[]) => void;
    onChangeLocation: (ids: string[]) => void;
    isProcessing: boolean;
}

export default function BulkActionBar({
    selectedIds,
    onClearSelection,
    onDelete,
    onChangeCategory,
    onChangeStatus,
    onChangeLocation,
    isProcessing
}: BulkActionBarProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (selectedIds.length === 0) return null;

    const count = selectedIds.length;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-stone-200 px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                    {count} selected
                </span>
                <button
                    onClick={onClearSelection}
                    className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="w-px h-6 bg-stone-200" />

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onChangeCategory(selectedIds)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Tag className="w-4 h-4" />
                    Category
                </button>
                <button
                    onClick={() => onChangeLocation(selectedIds)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <MapPin className="w-4 h-4" />
                    Location
                </button>
                <button
                    onClick={() => onChangeStatus(selectedIds)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                >
                    <BookOpen className="w-4 h-4" />
                    Status
                </button>

                <div className="w-px h-6 bg-stone-200 mx-2" />

                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <span className="text-sm font-medium text-red-600">Delete {count}?</span>
                        <button
                            onClick={() => onDelete(selectedIds)}
                            disabled={isProcessing}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm disabled:opacity-50"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isProcessing}
                            className="text-stone-500 hover:text-stone-800 px-2 py-1.5 text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}
