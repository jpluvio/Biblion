import { getBooks } from '@/app/actions/books';
import prisma from '@/lib/prisma';
import BookList from '@/app/components/BookList';
import { BookWithRelations } from '@/types/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CategoryDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch category details
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { books: true },
            },
        },
    });

    if (!category) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-red-600">
                Category not found.
            </div>
        );
    }

    // Fetch books in this category
    const { success, books: booksData, error } = await getBooks({ categoryId: id });
    const books = booksData as BookWithRelations[] | undefined;

    return (
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Categories
                </Link>

                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                    {category.color && (
                        <span
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: category.color }}
                            title={category.color}
                        />
                    )}
                </div>
                <p className="text-gray-500 mt-2">
                    {category._count.books} books in this category
                </p>
            </div>

            {success && books ? (
                <BookList books={books} />
            ) : (
                <div className="text-red-600 p-4 bg-red-50 rounded-md">
                    Error loading books: {error}
                </div>
            )}
        </main>
    );
}
