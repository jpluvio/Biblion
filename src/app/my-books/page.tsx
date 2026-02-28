import { getMyBooks } from '@/app/actions/mybooks';
import { getMyLoans } from '@/app/actions/loans';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MyBooksClient from './MyBooksClient';

export default async function MyBooksPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string, q?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const params = await searchParams;
    const filter = params.status || 'All';
    const query = params.q;

    // Parallel fetching
    const [booksResult, loansResult] = await Promise.all([
        getMyBooks({ status: filter, query }),
        getMyLoans()
    ]);

    const { success: booksSuccess, statuses, error: booksError } = booksResult;
    const { success: loansSuccess, loans, error: loansError } = loansResult;

    if (!booksSuccess || !statuses) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-red-600">
                Error loading books: {booksError}
            </div>
        );
    }

    // We fail gracefully for loans if there's an error, just passing empty array
    const userLoans = loansSuccess && loans ? loans : [];

    return <MyBooksClient statuses={statuses} loans={userLoans} currentFilter={filter} />;
}
