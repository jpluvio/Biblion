'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Check, Plus, Search } from 'lucide-react';
import { CategoryWithChildren } from '@/app/actions/categories';
import CategoryIcon from './CategoryIcon';

interface CategoryPickerProps {
    selectedCategories: CategoryWithChildren[];
    allCategories: CategoryWithChildren[];
    onChange: (categories: CategoryWithChildren[]) => void;
    placeholder?: string;
}

export default function CategoryPicker({
    selectedCategories,
    allCategories,
    onChange,
    placeholder = "Select categories..."
}: CategoryPickerProps) {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Flatten all categories for easier searching (including children if needed, but for now top-level)
    // If we want to support nested categories in picker, we should flatten them.
    // Let's stick to the flattening logic used in CategoryManager or similar if available, 
    // or just flatten them here simply.
    const flatten = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
        let res: CategoryWithChildren[] = [];
        for (const cat of cats) {
            res.push(cat);
            if (cat.children) {
                res = res.concat(flatten(cat.children));
            }
        }
        return res;
    };

    const flatCategories = flatten(allCategories);

    const filteredCategories = flatCategories.filter(cat =>
        cat.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedCategories.some(selected => selected.id === cat.id)
    );

    const handleSelect = (category: CategoryWithChildren) => {
        onChange([...selectedCategories, category]);
        setInputValue('');
        setIsOpen(false);
    };

    const handleRemove = (categoryId: string) => {
        onChange(selectedCategories.filter(c => c.id !== categoryId));
    };

    const handleCreate = () => {
        if (!inputValue.trim()) return;
        // Create a temporary "new" category object
        // In reality, the backend will handle creation by name if ID doesn't exist or we pass names.
        // For UI purposes, we need a shape.
        const newCategory: CategoryWithChildren = {
            id: `temp-${Date.now()}`, // Temp ID
            name: inputValue.trim(),
            color: null,
            icon: null,
            parentId: null,
            children: [],
            _count: { books: 0 }
        };
        onChange([...selectedCategories, newCategory]);
        setInputValue('');
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-input min-h-[42px]">
                {selectedCategories.map(cat => (
                    <span
                        key={cat.id}
                        className="inline-flex items-center px-2 py-1 rounded bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200 gap-1"
                        style={cat.color ? { backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}40` } : {}}
                    >
                        <CategoryIcon name={cat.icon} className="w-3 h-3" />
                        {cat.name}
                        <button
                            type="button"
                            onClick={() => handleRemove(cat.id)}
                            className="ml-1 text-current hover:opacity-70 focus:outline-none"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (filteredCategories.length > 0) {
                                handleSelect(filteredCategories[0]);
                            } else {
                                handleCreate();
                            }
                        }
                        if (e.key === 'Backspace' && !inputValue && selectedCategories.length > 0) {
                            handleRemove(selectedCategories[selectedCategories.length - 1].id);
                        }
                    }}
                    className="flex-1 bg-transparent outline-none text-sm min-w-[80px]"
                    placeholder={selectedCategories.length === 0 ? placeholder : ""}
                />
            </div>

            {isOpen && (inputValue || filteredCategories.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredCategories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelect(cat)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <CategoryIcon name={cat.icon} className="w-4 h-4 text-gray-500" />
                            {cat.name}
                        </button>
                    ))}
                    {inputValue && !filteredCategories.find(c => c.name.toLowerCase() === inputValue.toLowerCase()) && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Create "{inputValue}"
                        </button>
                    )}
                    {filteredCategories.length === 0 && !inputValue && (
                        <div className="px-4 py-2 text-sm text-gray-500">No categories found.</div>
                    )}
                </div>
            )}

            {/* Hidden Input for Form Submission - serializing full objects to handle IDs and new creations */}
            <input
                type="hidden"
                name="categories"
                value={JSON.stringify(selectedCategories.map(c => ({
                    id: c.id,
                    name: c.name,
                    isNew: c.id.startsWith('temp-')
                })))}
            />
        </div>
    );
}
