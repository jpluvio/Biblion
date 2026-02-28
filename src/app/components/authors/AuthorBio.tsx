'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchAndSaveAuthorBio } from '@/app/actions/authors';

interface AuthorBioProps {
    author: {
        id: string;
        name: string;
        biography?: string | null;
    };
}

export default function AuthorBio({ author }: AuthorBioProps) {
    const [bio, setBio] = useState<string | null>(author.biography || null);
    const [isLoading, setIsLoading] = useState(!author.biography);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchBio() {
            if (author.biography) {
                if (isMounted) setIsLoading(false);
                return;
            }

            try {
                const result = await fetchAndSaveAuthorBio(author.id, author.name);

                if (result.success && result.bio) {
                    if (isMounted) setBio(result.bio);
                } else {
                    if (isMounted) setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch bio:', err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        fetchBio();

        return () => { isMounted = false; };
    }, [author.id, author.name, author.biography]);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-stone-400 text-sm">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading biography...
            </div>
        );
    }

    if (error || !bio) {
        return (
            <p className="text-sm text-stone-500 italic">
                Biography not available.
            </p>
        );
    }

    return (
        <div className="space-y-2 animate-in fade-in duration-500">
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                {bio}
            </p>
        </div>
    );
}
