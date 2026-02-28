'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number; // If 1, acts like a single value bubble input (e.g. Owner)
    suggestions?: string[]; // Optional list of auto-complete suggestions
}

export default function TagInput({
    value = [],
    onChange,
    placeholder = 'Add a tag...',
    maxTags,
    suggestions = []
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && !inputRef.current?.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.trim() && suggestions.length > 0) {
            const filtered = suggestions.filter(s =>
                s.toLowerCase().includes(val.toLowerCase()) && !value.includes(s)
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        if (maxTags && value.length >= maxTags) {
            // For single tag mode
            // If user types manually when maxTags reached? 
            // Maybe we should allow replacing if they type?
            // But UI-wise, usually we clear first. 
            // Let's assume manual typing is allowed only if < maxTags.
            // But to support "replacing", current logic blocks.
            // If maxTags=1, usually the input is hidden if value exists (our showInput logic).
            // So this only triggers if value is empty.
            return;
        }

        if (!value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const addSuggestion = (suggestion: string) => {
        if (maxTags && value.length >= maxTags) {
            // For single tag mode (Owner), replace
            onChange([suggestion]);
        } else if (!value.includes(suggestion)) {
            onChange([...value, suggestion]);
        }
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            // If suggestions are shown and there's an exact match or user just hits enter?
            // Prioritize exactly matching suggestion or just add input?
            // Basic behavior: add input value.
            addTag();
            setShowSuggestions(false);
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value.length - 1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    // If maxTags is 1 and we have a value, don't show input? 
    // Or show input only if empty?
    const showInput = !maxTags || value.length < maxTags;

    return (
        <div
            className="flex flex-wrap gap-2 p-2 bg-white border border-stone-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all cursor-text min-h-[42px] relative"
            onClick={() => inputRef.current?.focus()}
        >
            {value.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 animate-in zoom-in-50 duration-200"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(index); }}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 text-blue-600 focus:outline-none"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    {/* Hidden input to submit with forms if needed, though we usually handle state manually */}
                    <input type="hidden" name={maxTags === 1 ? "owner" : "tags"} value={tag} />
                </span>
            ))}

            {showInput && (
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        // Delay blur to allow clicking suggestions
                        setTimeout(() => {
                            addTag();
                        }, 200);
                    }}
                    className="flex-1 outline-none bg-transparent min-w-[80px] text-sm text-stone-900 placeholder:text-stone-400"
                    placeholder={value.length === 0 ? placeholder : ''}
                />
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="px-4 py-2 hover:bg-stone-100 cursor-pointer text-sm text-stone-700"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur
                                addSuggestion(suggestion);
                            }}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
