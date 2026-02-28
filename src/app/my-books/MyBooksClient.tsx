'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, User, Filter, Calendar } from 'lucide-react';
import StatusBadge from '@/app/components/StatusBadge';
import Link from 'next/link';

const STATUS_FILTERS = ['All', 'Lent Books', 'To read', 'Reading', 'Studying', 'Read', 'Paused', 'Dropped', 'Lent'];

const STATUS_COLORS: Record<string, string> = {
    'All': 'bg-gray-100 text-gray-800 border-gray-300',
    'Lent Books': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'To read': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Reading': 'bg-green-100 text-green-800 border-green-300',
    'Studying': 'bg-teal-100 text-teal-800 border-teal-300',
    'Read': 'bg-blue-100 text-blue-800 border-blue-300',
    'Paused': 'bg-orange-100 text-orange-800 border-orange-300',
    'Dropped': 'bg-red-100 text-red-800 border-red-300',
    'Lent': 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

type StatusWithBook = {
    id: string;
    status: string;
    updatedAt: Date;
    book: {
        id: string;
        title: string;
        isbn: string | null;
        author: { id: string; name: string };
        categories: { id: string; name: string }[];
        readingStatuses: { status: string; user: { name: string | null; email: string | null } }[];
    };
};

type LoanWithBook = {
    id: string;
    borrowedAt: Date;
    dueDate: Date | null;
    borrowerName: string;
    book: {
        id: string;
        title: string;
        author: { name: string };
    };
};

export default function MyBooksClient({
    statuses,
    loans,
    currentFilter,
}: {
    statuses: StatusWithBook[];
    loans: LoanWithBook[];
    currentFilter: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filter === 'All') {
            params.delete('status');
        } else {
            params.set('status', filter);
        }
        router.push(`/my-books?${params.toString()}`);
    };

    const isLoansView = currentFilter === 'Lent Books';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-2">
                    <BookOpen className="h-7 w-7 text-indigo-600" />
                    My Books
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Your personal reading tracker
                </p>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-gray-400" />
                {STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => handleFilterChange(filter)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
                            ${currentFilter === filter
                                ? `${STATUS_COLORS[filter]} ring-2 ring-offset-1 ring-indigo-400 shadow-sm`
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {isLoansView ? (
                // Loans Grid
                loans.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No active loans</h3>
                        <p className="mt-1 text-sm text-gray-500">You haven't lent any books.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loans.map((loan) => (
                            <div key={loan.id} className="bg-white overflow-hidden shadow rounded-lg border border-indigo-100 hover:shadow-md transition-shadow duration-200">
                                <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center text-xs text-indigo-800">
                                    <span className="font-semibold">Lent to: {loan.borrowerName}</span>
                                    <span>Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <Link href={`/books/${loan.book.id}`} className="block">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 truncate hover:text-indigo-600 transition-colors">
                                            {loan.book.title}
                                        </h3>
                                    </Link>
                                    <p className="mt-1 text-sm text-gray-500">
                                        by {loan.book.author.name}
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            href={`/books/${loan.book.id}`}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            View & Return &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                // Book Grid (Existing)
                statuses.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No books found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {currentFilter !== 'All'
                                ? `You have no books with status "${currentFilter}".`
                                : 'You haven\'t set a status on any book yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statuses.map((rs) => {
                            const activeReaderObj = rs.book.readingStatuses.find(s => s.status === 'Reading');
                            const activeReaderName = activeReaderObj
                                ? (activeReaderObj.user.name || activeReaderObj.user.email)
                                : null;

                            return (
                                <div key={rs.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                    <div className="px-4 py-5 sm:p-6">
                                        <Link href={`/books/${rs.book.id}`} className="block">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 truncate hover:text-indigo-600 transition-colors" title={rs.book.title}>
                                                {rs.book.title}
                                            </h3>
                                        </Link>
                                        <div className="mt-2 max-w-xl text-sm text-gray-500 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span className="truncate">{rs.book.author.name}</span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                                            <StatusBadge
                                                bookId={rs.book.id}
                                                currentStatus={rs.status}
                                                activeReader={activeReaderName}
                                            />
                                            {rs.book.categories.map((cat) => (
                                                <span key={cat.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {cat.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
}
