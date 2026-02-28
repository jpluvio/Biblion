import { getBooks } from './actions/books';
import { getCategories } from './actions/categories';
import { getLocations } from './actions/locations';
import { getUsers } from './actions/admin';
import { BookWithRelations } from '@/types/types';
import HomeContent from './components/HomeContent';

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ q?: string, category?: string, subcategory?: string, locationId?: string, status?: string, sort?: string }>;
}) {
    const params = await searchParams;
    const query = params.q;
    const category = params.category;
    const subcategory = params.subcategory;
    const status = params.status;
    const sort = params.sort;

    const [
        { success, books: booksData, error },
        { success: catSuccess, categories: categoriesData },
        { success: locSuccess, locations: locationsData },
        { success: userSuccess, users: usersData }
    ] = await Promise.all([
        getBooks({
            query,
            categoryId: subcategory || category,
            locationId: params.locationId,
            status,
            sort
        }),
        getCategories(),
        getLocations(),
        getUsers()
    ]);

    const books = booksData as BookWithRelations[] | undefined;
    const categories = categoriesData || [];
    const locations = locationsData || [];
    const users = usersData || [];

    if (!success || !books) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-7xl mx-auto text-red-600">
                    Error loading books: {error}
                </div>
            </div>
        );
    }

    return <HomeContent initialBooks={books} allCategories={categories} allLocations={locations as any} allUsers={users} />;
}
