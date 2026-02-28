'use client';

import { BookOpen, User as UserIcon, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import CategoryIcon from './categories/CategoryIcon';
import { useSession } from 'next-auth/react';
import { BookWithRelations } from '@/types/types';
import Link from 'next/link';

interface BookListProps {
    books: BookWithRelations[];
    viewMode?: 'grid' | 'list';
    selectedIds?: string[];
    onSelectionChange?: (id: string, isSelected: boolean) => void;
}

export default function BookList({ books, viewMode = 'grid', selectedIds, onSelectionChange }: BookListProps) {
    const { data: session } = useSession();
    const currentUserEmail = session?.user?.email;

    if (books.length === 0) {
        return (
            <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                <div className="bg-background p-4 rounded-full inline-block shadow-sm mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No books available</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    Your library is empty. Add your first book to get started!
                </p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="flex flex-col gap-2">
                {books.map((book) => {
                    const myTargetId = session?.user ? (session as any).user.id : null;
                    const myStatus = book.readingStatuses?.find((rs: any) => rs.userId === myTargetId)?.status || 'To read';
                    const activeReaderObj = book.readingStatuses?.find((rs: any) => rs.status === 'Reading' && rs.userId !== myTargetId);
                    const activeReaderName = activeReaderObj ? 'another user' : null;

                    const isSelected = selectedIds?.includes(book.id) || false;

                    const formatLocation = (loc: any) => {
                        if (!loc) return null;
                        return `${loc.parent?.parent ? loc.parent.parent.name + ' > ' : ''}${loc.parent ? loc.parent.name + ' > ' : ''}${loc.name}`;
                    };
                    const locString = formatLocation((book as any).location);

                    return (
                        <div key={book.id} className={`group bg-card hover:bg-muted/30 rounded-lg border p-3 flex items-center gap-4 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}>
                            {/* Checkbox */}
                            {onSelectionChange && (
                                <div className="flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => onSelectionChange(book.id, e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer mt-1"
                                    />
                                </div>
                            )}

                            {/* Tiny Cover */}
                            <Link href={`/books/${book.id}`} className="shrink-0 w-12 h-16 bg-muted rounded overflow-hidden border border-border">
                                {book.coverImage ? (
                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground/30">
                                        {book.title.substring(0, 1)}
                                    </div>
                                )}
                            </Link>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/books/${book.id}`} className="block">
                                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{book.title}</h3>
                                </Link>
                                <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                                    <Link href={`/authors/${book.author.id}`} className="hover:text-foreground hover:underline transition-colors shrink-0">
                                        {book.author.name}
                                    </Link>
                                    {locString && (
                                        <span className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                                            <MapPin className="w-3 h-3" />
                                            {locString}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="hidden sm:block">
                                <StatusBadge
                                    bookId={book.id}
                                    currentStatus={myStatus}
                                    activeReader={activeReaderName}
                                />
                            </div>

                            {/* Categories (First one only) */}
                            {book.categories.length > 0 && (
                                <div className="hidden md:block">
                                    <span
                                        className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-stone-100 text-stone-600 border border-stone-200 flex items-center gap-1"
                                        style={book.categories[0].color ? { color: book.categories[0].color, borderColor: book.categories[0].color + '40', backgroundColor: book.categories[0].color + '10' } : {}}
                                    >
                                        <CategoryIcon name={(book.categories[0] as any).icon} className="w-3 h-3" />
                                        {book.categories[0].name}
                                    </span>
                                </div>
                            )}

                            {/* Chevron / Link */}
                            <Link href={`/books/${book.id}`} className="p-2 text-muted-foreground hover:text-foreground">
                                <BookOpen className="w-4 h-4" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
            {books.map((book) => {
                const myTargetId = session?.user ? (session as any).user.id : null;
                const myStatus = book.readingStatuses?.find((rs: any) => rs.userId === myTargetId)?.status || 'To read';
                const activeReaderObj = book.readingStatuses?.find((rs: any) => rs.status === 'Reading' && rs.userId !== myTargetId);
                const activeReaderName = activeReaderObj ? 'another user' : null;

                const isSelected = selectedIds?.includes(book.id) || false;

                const formatLocation = (loc: any) => {
                    if (!loc) return null;
                    return `${loc.parent?.parent ? loc.parent.parent.name + ' > ' : ''}${loc.parent ? loc.parent.name + ' > ' : ''}${loc.name}`;
                };
                const locString = formatLocation((book as any).location);

                return (
                    <div
                        key={book.id}
                        className={`group bg-card text-card-foreground rounded-xl border overflow-hidden card-hover flex flex-col h-full relative ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                    >
                        {/* Checkbox (Absolute positioning on card) */}
                        {onSelectionChange && (
                            <div className="absolute top-2 left-2 z-10">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => onSelectionChange(book.id, e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary shadow-sm cursor-pointer bg-white"
                                />
                            </div>
                        )}

                        {/* Cover Image or Placeholder */}
                        <Link href={`/books/${book.id}`} className="aspect-[2/3] bg-muted relative flex items-center justify-center overflow-hidden border-b border-border group-hover:opacity-90 transition-opacity">
                            {book.coverImage ? (
                                <img
                                    src={book.coverImage}
                                    alt={`Cover of ${book.title}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}

                            {/* Placeholder (shown if no cover or error) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${book.coverImage ? 'hidden' : ''}`}>
                                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                                <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-wider block">
                                    {book.title.substring(0, 2)}
                                </span>
                            </div>

                            {/* Category Badge (Top Right) */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end pt-1 pr-1">
                                {book.categories.slice(0, 2).map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="text-[10px] uppercase font-bold px-1.5 py-1 rounded bg-white/90 backdrop-blur shadow-sm border border-stone-200 flex items-center justify-center group/badge"
                                        style={cat.color ? { color: cat.color, borderColor: cat.color + '40' } : { color: 'var(--primary)' }}
                                        title={cat.name}
                                    >
                                        <CategoryIcon name={(cat as any).icon} className="w-3.5 h-3.5" />
                                        {/* Name appears on hover on desktop, or takes minimal space */}
                                        <span className="ml-1 hidden sm:group-hover/badge:block truncate max-w-[60px]">{cat.name}</span>
                                    </span>
                                ))}
                            </div>
                        </Link>

                        <div className="p-2 flex flex-col flex-1">
                            <Link href={`/books/${book.id}`} className="block">
                                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors" title={book.title}>
                                    {book.title}
                                </h3>
                            </Link>

                            <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
                                <Link href={`/authors/${book.author.id}`} className="line-clamp-1 hover:text-stone-900 hover:underline transition-colors">
                                    {book.author.name}
                                </Link>
                            </div>

                            {locString && (
                                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-stone-500 bg-stone-100 w-fit px-1.5 py-0.5 rounded border border-stone-200 line-clamp-1 break-all">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{locString}</span>
                                </div>
                            )}

                            <div className="mt-auto pt-2 flex items-center justify-between gap-1">
                                <StatusBadge
                                    bookId={book.id}
                                    currentStatus={myStatus}
                                    activeReader={activeReaderName}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
