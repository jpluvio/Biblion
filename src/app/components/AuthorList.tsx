'use client';

import Link from 'next/link';
import { User as UserIcon, BookOpen } from 'lucide-react';
import type { Prisma } from '@prisma/client';

type AuthorWithBooks = Prisma.AuthorGetPayload<{
    include: { books: true }
}>;

export default function AuthorList({ authors }: { authors: AuthorWithBooks[] }) {
    if (authors.length === 0) {
        return (
            <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                <div className="bg-background p-4 rounded-full inline-block shadow-sm mb-4">
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No authors found</h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {authors.map(author => (
                <Link
                    key={author.id}
                    href={`/authors/${author.id}`}
                    className="group bg-card hover:bg-muted/30 border border-border rounded-xl p-6 flex flex-col items-center text-center transition-colors"
                >
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UserIcon className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">{author.name}</h3>

                    <div className="mt-auto flex items-center gap-1.5 text-sm text-stone-500 font-medium bg-stone-100 px-3 py-1 rounded-full">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{author.books.length} book{author.books.length !== 1 && 's'}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}
