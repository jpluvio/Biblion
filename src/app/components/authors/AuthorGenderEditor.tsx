'use client';

import { useState } from 'react';
import { updateAuthor } from '@/app/actions/authors';
import { Pencil, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    authorId: string;
    initialGender?: string | null;
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Unknown'];

export default function AuthorGenderEditor({ authorId, initialGender }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [gender, setGender] = useState(initialGender || '');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click if any
        setIsLoading(true);
        const result = await updateAuthor(authorId, { gender: gender || null });
        setIsLoading(false);
        if (result.success) {
            setIsEditing(false);
            router.refresh();
        } else {
            alert('Failed to update gender');
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setGender(initialGender || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 mt-1">
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-xs border-stone-300 rounded shadow-sm focus:border-stone-500 focus:ring-stone-500 py-1 pl-2 pr-8"
                    disabled={isLoading}
                    autoFocus
                >
                    <option value="">Select Gender</option>
                    {GENDERS.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                >
                    <Check className="w-4 h-4" />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Cancel"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div
            className="flex items-center gap-2 mt-1 group cursor-pointer w-fit"
            onClick={() => setIsEditing(true)}
            title="Click to edit gender"
        >
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${gender ? 'bg-stone-100 text-stone-600' : 'bg-stone-50 text-stone-400 border border-dashed border-stone-300'}`}>
                {gender || 'Set Gender'}
            </span>
            <Pencil className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
