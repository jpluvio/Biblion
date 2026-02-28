'use client';

import { useEffect, useState } from 'react';
import { getSuggestion, SuggestionCriteria } from '@/app/actions/suggestions';
import { getCategories, CategoryWithChildren } from '@/app/actions/categories';
import Link from 'next/link';
import { Sparkles, ArrowRight, RefreshCw, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function BookSuggestion() {
    const [suggestion, setSuggestion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('suggestion-collapsed');
            return stored ? stored === 'true' : true;
        }
        return true;
    });

    // Filters
    const [lengthFilter, setLengthFilter] = useState<SuggestionCriteria['length']>('any');
    const [categoryFilter, setCategoryFilter] = useState<string>('any');
    const [languageFilter, setLanguageFilter] = useState<string>('any');
    const [languages, setLanguages] = useState<string[]>([]);

    const fetchSuggestion = async () => {
        setLoading(true);
        const res = await getSuggestion({ length: lengthFilter, categoryId: categoryFilter, language: languageFilter });
        if (res.success) {
            setSuggestion(res.suggestion);
        }
        setLoading(false);
    };

    const fetchCategories = async () => {
        const res = await getCategories();
        if (res.success && res.categories) {
            setCategories(res.categories);
        }
    };

    const fetchLanguages = async () => {
        try {
            const res = await fetch('/api/languages');
            const data = await res.json();
            if (data.languages) setLanguages(data.languages);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        if (!collapsed) {
            fetchCategories();
            fetchLanguages();
            fetchSuggestion();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNewSuggestion = () => {
        fetchSuggestion();
    };

    const toggleCollapse = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('suggestion-collapsed', String(next));
        if (!next) {
            if (!suggestion) fetchSuggestion();
            if (categories.length === 0) fetchCategories();
            if (languages.length === 0) fetchLanguages();
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100 shadow-sm relative overflow-hidden group mb-6">
            {/* Collapsible Header */}
            <button
                onClick={toggleCollapse}
                className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/50 transition-colors"
            >
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    Next Adventure
                </div>
                {collapsed ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronUp className="w-4 h-4 text-stone-400" />}
            </button>

            {!collapsed && (
                <div className="px-6 pb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-indigo-600" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-6">
                        {/* Suggestion Display Area */}
                        <div className="flex-1">
                            {loading ? (
                                <div className="h-32 bg-stone-100/50 animate-pulse rounded-lg border border-stone-100"></div>
                            ) : !suggestion ? (
                                <div className="h-32 flex flex-col items-center justify-center text-stone-500 bg-white/50 rounded-lg border border-stone-200 border-dashed">
                                    <p className="text-sm font-medium">No untouched books found!</p>
                                    <p className="text-xs">Try adjusting your filters.</p>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                                        {suggestion.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 text-sm font-medium">
                                        by {suggestion.author.name}
                                    </p>

                                    <div className="flex items-start gap-4">
                                        {suggestion.coverImage ? (
                                            <div className="w-20 h-28 bg-gray-200 rounded shadow-sm overflow-hidden flex-shrink-0 border border-stone-200">
                                                <img src={suggestion.coverImage} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-28 bg-indigo-100/50 rounded shadow-sm flex items-center justify-center flex-shrink-0 border border-indigo-100/50">
                                                <span className="text-indigo-300 text-xs text-center px-2">No Cover</span>
                                            </div>
                                        )}

                                        <div className="flex-1 flex flex-col h-full">
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-3 leading-relaxed hidden sm:block">
                                                {suggestion.description || "Awaiting your discovery..."}
                                            </p>
                                            <div className="mt-auto pt-2">
                                                <Link
                                                    href={`/books/${suggestion.id}`}
                                                    className="inline-flex items-center justify-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors shadow-sm"
                                                >
                                                    View Book <ArrowRight className="w-4 h-4 ml-1.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filters Area */}
                        <div className="w-full md:w-64 flex flex-col gap-4 bg-white/60 p-4 rounded-lg border border-indigo-50/80 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-stone-700 font-medium text-sm mb-1">
                                <Filter className="w-4 h-4" />
                                Criteria
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Length</label>
                                <select
                                    value={lengthFilter}
                                    onChange={(e) => setLengthFilter(e.target.value as any)}
                                    className="w-full bg-white border border-stone-200 text-stone-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="any">Any Length</option>
                                    <option value="short">Short (&lt; 250 pages)</option>
                                    <option value="medium">Medium (250-500 pages)</option>
                                    <option value="long">Long (&gt; 500 pages)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full bg-white border border-stone-200 text-stone-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="any">Any Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Language</label>
                                <select
                                    value={languageFilter}
                                    onChange={(e) => setLanguageFilter(e.target.value)}
                                    className="w-full bg-white border border-stone-200 text-stone-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="any">Any Language</option>
                                    {languages.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-auto pt-2">
                                <button
                                    onClick={handleNewSuggestion}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Show Another
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

