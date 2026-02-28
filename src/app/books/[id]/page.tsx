import { getBook } from '@/app/actions/books';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, FileText, Globe, Layers, User, Hash, Building2, MapPin } from 'lucide-react';
import StatusBadge from '@/app/components/StatusBadge';
import CategoryIcon from '@/app/components/categories/CategoryIcon';
import { BookWithRelations } from '@/types/types';
import BackButton from '@/app/components/ui/BackButton';

import { returnBook } from '@/app/actions/loans';
import LendBookButton from '@/app/components/LendBookButton';

export default async function BookDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const { id } = await params;
    const { success, book: bookData, error } = await getBook(id);
    const book = bookData as unknown as BookWithRelations; // temporary cast until actions are typed

    if (!success || !book) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">
                <h2 className="text-2xl font-bold">Error</h2>
                <p>{error || 'Book not found'}</p>
                <BackButton />
            </div>
        );
    }

    const currentUserEmail = session.user?.email;

    // Determine reading status for current user.
    // getBook returns the full readingStatuses with user relations for the details page, 
    // but we casted it to BookWithRelations which is the light list type. 
    // Using 'any' cast for these specific fields for now to bypass the strict BookWithRelations light type constraint.
    const myStatus = (book as any).readingStatuses.find((rs: any) => rs.user.email === currentUserEmail)?.status || 'To read';

    // Determine loan status
    const activeLoan = ((book as any).loans || []).find((l: any) => !l.returnedAt);
    const isLent = !!activeLoan;
    // user in activeLoan is the lender
    const isLentByMe = activeLoan?.user.email === currentUserEmail;
    const borrowerName = activeLoan?.borrowerName;
    const lenderName = activeLoan?.user.name || activeLoan?.user.email;
    const dueDate = activeLoan?.dueDate ? new Date(activeLoan.dueDate).toLocaleDateString() : null;

    async function handleReturn() {
        'use server';
        if (activeLoan) {
            await returnBook(activeLoan.id);
        }
    }

    // Determine active reader (anyone reading it)
    const activeReaderObj = (book as any).readingStatuses.find((rs: any) => rs.status === 'Reading' && rs.user.email !== currentUserEmail);
    const activeReaderName = activeReaderObj
        ? (activeReaderObj.user.name || activeReaderObj.user.email)
        : null;

    // Helper to format location path
    const formatLocationPath = (location: any) => {
        if (!location) return null;
        let path = [location.name];
        let current = location.parent;
        while (current) {
            path.unshift(current.name);
            current = current.parent;
        }
        return path.join(' ➔ ');
    };

    const locationPath = formatLocationPath((book as any).location);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BackButton />

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Cover Image */}
                    <div className="flex-shrink-0 w-32 sm:w-40 aspect-[2/3] bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center">
                        {book.coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={book.coverImage}
                                alt={`Cover of ${book.title}`}
                                className="w-full h-full object-cover"
                            />
                        ) : null}
                        <div className={`text-center p-2 ${book.coverImage ? 'hidden' : ''}`}>
                            <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
                            <span className="text-[10px] text-muted-foreground uppercase">No Cover</span>
                        </div>
                    </div>

                    {/* Book Info Header */}
                    <div className="flex-1 flex flex-col justify-between h-full min-h-[160px]">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {book.title}
                            </h1>
                            <p className="mt-2 text-lg text-gray-500 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <Link href={`/authors/${book.author.id}`} className="hover:text-indigo-600 hover:underline transition-colors">
                                    {book.author.name}
                                </Link>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-auto">
                            <StatusBadge
                                bookId={book.id}
                                currentStatus={myStatus}
                                activeReader={activeReaderName}
                            />
                            <Link
                                href={`/books/${book.id}/edit`}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Edit Book
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Loan Status Banner */}
                <div className={`px-4 py-3 sm:px-6 border-t ${isLent ? (isLentByMe ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-gray-200') : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <BookOpen className={`w-5 h-5 mr-2 ${isLent ? 'text-amber-600' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${isLent ? 'text-amber-800' : 'text-gray-500'}`}>
                                {isLent
                                    ? (isLentByMe ? `Lent to ${borrowerName} (by you)` : `Lent to ${borrowerName} by ${lenderName}`)
                                    : 'Available for lending'
                                }
                            </span>
                        </div>

                        {!isLent && (
                            <LendBookButton bookId={book.id} />
                        )}

                        {isLentByMe && (
                            <form action={handleReturn}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Mark Returned
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        {book.description && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Description
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                    {book.description}
                                </dd>
                            </div>
                        )}

                        {book.categories.length > 0 && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    Categories
                                </dt>
                                <dd className="mt-1 flex flex-wrap gap-2">
                                    {book.categories.map(cat => (
                                        <span key={cat.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 gap-1">
                                            <CategoryIcon name={(cat as any).icon} className="w-3 h-3" />
                                            {cat.name}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        )}

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                ISBN
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono select-all bg-gray-50 px-2 py-1 rounded inline-block">{book.isbn || 'N/A'}</dd>
                        </div>

                        {locationPath && (
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">{locationPath}</dd>
                            </div>
                        )}

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Language
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{book.language || 'N/A'}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Publisher
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{(book as any).publisher || 'N/A'}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Published
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{book.publishYear || 'N/A'}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Pages
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{book.pages || 'N/A'}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Owner copy
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{(book as any).user ? (book as any).user.name : (book.owner || 'Library')}</dd>
                        </div>

                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Added</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(book.createdAt).toLocaleDateString('en-GB')}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
