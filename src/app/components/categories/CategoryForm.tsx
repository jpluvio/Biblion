'use client';

import { useState, useEffect } from 'react';
import { CategoryWithChildren } from '@/app/actions/categories';
import IconPicker from './IconPicker';

type CategoryFormProps = {
    initialData?: CategoryWithChildren;
    defaultParentId?: string | null;
    categories?: CategoryWithChildren[]; // For parent selection
    onSubmit: (data: { name: string; color: string; icon: string; parentId: string | null }) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
};

// Start Helper to flatten categories for the select dropdown
function flattenCategories(categories: CategoryWithChildren[], level = 0): { id: string; name: string; level: number }[] {
    let result: { id: string; name: string; level: number }[] = [];
    for (const cat of categories) {
        result.push({ id: cat.id, name: cat.name, level });
        if (cat.children) {
            result = result.concat(flattenCategories(cat.children, level + 1));
        }
    }
    return result;
}

export default function CategoryForm({ initialData, defaultParentId, categories = [], onSubmit, onCancel, isLoading }: CategoryFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [color, setColor] = useState(initialData?.color || '#3B82F6'); // Default Blue-500
    const [icon, setIcon] = useState(initialData?.icon || 'Book');
    const [parentId, setParentId] = useState(initialData?.parentId || defaultParentId || '');

    const flatCategories = flattenCategories(categories);

    // Filter out self and children from parent options if editing (prevent circular reference)
    const validParents = initialData
        ? flatCategories.filter(c => c.id !== initialData.id) // Simplistic check, ideally should check descendants too
        : flatCategories;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ name, color, icon, parentId: parentId || null });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="e.g. Science Fiction"
                />
            </div>



            <div>
                <IconPicker
                    value={icon}
                    onChange={setIcon}
                    color={color}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-3 mt-1">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-20 rounded border border-gray-300 cursor-pointer p-1"
                    />
                    <span className="text-sm text-gray-500">{color}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Parent Category (Optional)</label>
                <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                    <option value="">(None - Top Level)</option>
                    {validParents.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {'\u00A0'.repeat(cat.level * 4)}{cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-75 flex items-center gap-2"
                >
                    {isLoading ? 'Saving...' : 'Save Category'}
                </button>
            </div>
        </form>
    );
}
