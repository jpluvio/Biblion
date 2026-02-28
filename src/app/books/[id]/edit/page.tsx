import { getBook } from '@/app/actions/books';
import { getCategories } from '@/app/actions/categories';
import { getLocations } from '@/app/actions/locations';
import { getUsers } from '@/app/actions/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EditBookForm from '@/app/components/EditBookForm';
import BackButton from '@/app/components/ui/BackButton';
import { BookWithRelations } from '@/types/types';

export default async function EditBookPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const { id } = await params;
    const { success, book: bookData, error } = await getBook(id);
    const { success: catSuccess, categories: categoriesData } = await getCategories();
    const { success: locSuccess, locations: locationsData } = await getLocations();
    const { success: userSuccess, users: usersData } = await getUsers();

    const book = bookData as unknown as BookWithRelations; // temporary cast
    const allCategories = categoriesData || [];
    const allLocations = locationsData || [];
    const allUsers = usersData || [];

    if (!success || !book) {
        // ... error handling
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">
                <h2 className="text-2xl font-bold">Error</h2>
                <p>{error || 'Book not found'}</p>
                <BackButton fallbackHref="/" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BackButton fallbackHref={`/books/${book.id}`} label="Back to Book Details" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
                <p className="mt-1 text-sm text-gray-500">Update information for "{book.title}"</p>
            </div>

            <EditBookForm book={book} allCategories={allCategories} allLocations={allLocations as any} allUsers={allUsers} />
        </div>
    );
}
