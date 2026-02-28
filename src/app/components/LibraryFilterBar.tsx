'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryWithChildren } from '@/app/actions/categories';
import { LocationWithChildren } from '@/app/actions/locations';
import { useCallback, useMemo } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

interface LibraryFilterBarProps {
    categories: CategoryWithChildren[];
    locations: LocationWithChildren[];
}

export default function LibraryFilterBar({ categories, locations }: LibraryFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get('category') || '';
    const currentSubcategory = searchParams.get('subcategory') || '';
    const currentStatus = searchParams.get('status') || '';
    const currentLocation = searchParams.get('locationId') || '';
    const currentSort = searchParams.get('sort') || 'title_asc';

    // Recursively flatten all descendants for the selected parent category
    const subcategories = useMemo(() => {
        if (!currentCategory || currentCategory === 'none') return [];
        const parentCat = categories.find(c => c.id === currentCategory);
        if (!parentCat?.children) return [];

        const flatten = (cats: CategoryWithChildren[], depth: number): { id: string; name: string; depth: number }[] => {
            const result: { id: string; name: string; depth: number }[] = [];
            for (const cat of cats) {
                result.push({ id: cat.id, name: cat.name, depth });
                if (cat.children) {
                    result.push(...flatten(cat.children, depth + 1));
                }
            }
            return result;
        };
        return flatten(parentCat.children, 0);
    }, [currentCategory, categories]);

    // Top-level categories (those without a parent)
    const topLevelCategories = useMemo(() =>
        categories.filter(c => !c.parentId),
        [categories]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilterChange = (key: string, value: string) => {
        router.push(`/?${createQueryString(key, value)}`);
    };

    const renderLocationOptions = (locs: LocationWithChildren[], depth = 0): React.ReactNode[] => {
        return locs.flatMap((loc) => {
            const prefix = '—'.repeat(depth);
            const option = (
                <option key={loc.id} value={loc.id}>
                    {prefix ? `${prefix} ` : ''}{loc.name}
                </option>
            );
            const children = loc.children ? renderLocationOptions(loc.children, depth + 1) : [];
            return [option, ...children];
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-stone-600 font-medium mr-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={currentCategory}
                    onChange={(e) => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (e.target.value) params.set('category', e.target.value);
                        else params.delete('category');
                        params.delete('subcategory'); // Reset subcategory when category changes
                        router.push(`/?${params.toString()}`);
                    }}
                    className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-primary/20 outline-none hover:border-stone-300 transition-colors w-full sm:w-auto"
                >
                    <option value="">All Categories</option>
                    <option value="none">No Category</option>
                    {topLevelCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                {subcategories.length > 0 && (
                    <select
                        value={currentSubcategory}
                        onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                        className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-primary/20 outline-none hover:border-stone-300 transition-colors w-full sm:w-auto"
                    >
                        <option value="">All Subcategories</option>
                        {subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.depth > 0 ? `\u00A0\u00A0\u00A0↳ ${sub.name}` : sub.name}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    value={currentStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-primary/20 outline-none hover:border-stone-300 transition-colors w-full sm:w-auto"
                >
                    <option value="">All Statuses</option>
                    <option value="To read">To read</option>
                    <option value="To study">To study</option>
                    <option value="Reading">Reading</option>
                    <option value="Studying">Studying</option>
                    <option value="Read">Read</option>
                    <option value="Paused">Paused</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Lent">Lent Out</option>
                </select>

                <select
                    value={currentLocation}
                    onChange={(e) => handleFilterChange('locationId', e.target.value)}
                    className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-primary/20 outline-none hover:border-stone-300 transition-colors w-full sm:w-auto"
                >
                    <option value="">All Locations</option>
                    <option value="none">No Location</option>
                    {renderLocationOptions(locations)}
                </select>

                <div className="h-6 w-px bg-stone-200 mx-2 hidden lg:block"></div>

                <div className="flex items-center gap-2 text-stone-600 font-medium w-full sm:w-auto mt-2 sm:mt-0">
                    <ArrowUpDown className="w-4 h-4 hidden sm:block" />
                    <span className="sr-only sm:not-sr-only">Sort:</span>
                </div>
                <select
                    value={currentSort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:ring-2 focus:ring-primary/20 outline-none hover:border-stone-300 transition-colors w-full sm:w-auto"
                >
                    <option value="title_asc">Alphabetical (A-Z)</option>
                    <option value="title_desc">Alphabetical (Z-A)</option>
                    <option value="created_desc">Newly Added</option>
                    <option value="created_asc">Oldest Added</option>
                </select>

                {(currentCategory || currentStatus || currentLocation || currentSort !== 'title_asc') && (
                    <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto mt-2 sm:mt-0 text-sm text-stone-500 hover:text-stone-800 underline decoration-stone-300 underline-offset-2 text-left sm:text-right"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
