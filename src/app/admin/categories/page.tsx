import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCategories } from '@/app/actions/categories';
import CategoryManager from '@/app/components/categories/CategoryManager';

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const { success, categories } = await getCategories();

    return (
        <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
            <p className="text-muted-foreground mb-6">
                Manage your book categories and organization hierarchy.
            </p>

            {success && categories ? (
                <CategoryManager initialCategories={categories as any} />
                // cast to any or fix types if slight mismatch between prisma result and component props
            ) : (
                <div className="text-red-600 p-4 bg-red-50 rounded-md">
                    Failed to load categories.
                </div>
            )}
        </main>
    );
}
