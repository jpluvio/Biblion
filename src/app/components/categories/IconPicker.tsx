'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Book, Library, BookOpen, Bookmark, BookCopy, GraduationCap,
    Scroll, ScanFace, Languages, Globe, Map, Compass,
    FlaskConical, Dna, Atom, Microscope, Calculator,
    Binary, Cpu, Monitor, Keyboard, Mouse,
    Palette, Music, Mic, Headphones, Film, Camera, Image,
    Sword, Shield, Crown, Skull, Ghost,
    Heart, Star, Smile, Sparkles, Zap, Flame,
    Briefcase, Building, Landmark, Gavel, Scale,
    Utensils, Coffee, Pizza,
    Car, Plane, Ship, Bike,
    Home, Tent, Trees, Mountain, Sun, Moon,
    Users, Baby, User, UserPlus
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';

// Map of icons for the picker
const ICON_LIST = {
    // General / Books
    Book, Library, BookOpen, Bookmark, BookCopy, GraduationCap, Scroll,
    // Genres / Topics
    ScanFace, Languages, Globe, Map, Compass,
    FlaskConical, Dna, Atom, Microscope, Calculator,
    Binary, Cpu, Monitor, Keyboard, Mouse,
    Palette, Music, Mic, Headphones, Film, Camera, Image,
    Sword, Shield, Crown, Skull, Ghost,
    Heart, Star, Smile, Sparkles, Zap, Flame,
    Briefcase, Building, Landmark, Gavel, Scale,
    Utensils, Coffee, Pizza,
    Car, Plane, Ship, Bike,
    Home, Tent, Trees, Mountain, Sun, Moon,
    Users, Baby, User, UserPlus
};

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
    color?: string;
}

export default function IconPicker({ value, onChange, color }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    const handleSelect = (name: string) => {
        onChange(name);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 border border-stone-200 rounded-md bg-white hover:bg-stone-50 transition-colors w-full text-left"
            >
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-stone-100 border border-stone-200"
                    style={color ? { color: color, backgroundColor: `${color}15`, borderColor: `${color}30` } : {}}
                >
                    <CategoryIcon name={value} className="w-5 h-5" />
                </div>
                <span className="flex-1 text-stone-700 font-medium">{value}</span>
                <span className="text-xs text-stone-400">Click to change</span>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 p-3 bg-white border border-stone-200 rounded-lg shadow-xl w-64 md:w-80 max-h-60 overflow-y-auto grid grid-cols-5 md:grid-cols-6 gap-2">
                    {Object.keys(ICON_LIST).map((iconName) => (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => handleSelect(iconName)}
                            className={`
                                flex items-center justify-center w-10 h-10 rounded-md transition-all
                                ${value === iconName
                                    ? 'bg-primary/10 text-primary ring-2 ring-primary ring-offset-1'
                                    : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'}
                            `}
                            title={iconName}
                        >
                            <CategoryIcon name={iconName} className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
