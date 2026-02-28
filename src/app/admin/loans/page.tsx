import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, BookOpen, User } from 'lucide-react';
import { getActiveLoans } from '@/app/actions/loans';

export default async function AdminLoansPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/');
    }

    const { success, loans, error } = await getActiveLoans();

    if (!success || !loans) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">
                Error loading loans: {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all books currently lent to external borrowers.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loans.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active loans</h3>
                        <p className="mt-1 text-sm text-gray-500">All books are currently in the library.</p>
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200">
                        {loans.map((loan) => (
                            <li key={loan.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center truncate">
                                        <div className="flex-shrink-0 flex items-center gap-2 text-indigo-600 font-medium truncate">
                                            <BookOpen className="w-4 h-4" />
                                            <Link href={`/books/${loan.bookId}`} className="hover:underline">
                                                {loan.book.title}
                                            </Link>
                                        </div>
                                        <div className="mt-1 sm:mt-0 sm:ml-4 flex items-center text-sm text-gray-500">
                                            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            Lent by <span className="font-medium text-gray-900 mx-1">{loan.user.name || loan.user.email}</span>
                                            to <span className="font-medium text-indigo-900 ml-1">{loan.borrowerName}</span>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex flex-col items-end gap-1">
                                        <div className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Calendar className="mr-1.5 h-3 w-3 text-gray-400" />
                                            Due {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
