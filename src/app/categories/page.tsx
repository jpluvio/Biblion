import { getCategories } from '@/app/actions/categories';
import { getBooks } from '@/app/actions/books';
import Link from 'next/link';
import { Book, FolderOpen, ChevronRight } from 'lucide-react';

export default async function CategoriesPage() {
    const { categories } = await getCategories();
    // Helper to safely access categories since the return type might be complex or unified later
    const categoriesDisplay = categories || [];

    const { books } = await getBooks();

    // Organize books by category
    // This is a simple client-side like filtering for the view. 
    // Ideally we'd have an efficient query, but for a home library this is fine.
    const booksByCategory: Record<string, typeof books> = {};

    if (books && categoriesDisplay) {
        categoriesDisplay.forEach((cat) => {
            booksByCategory[cat.name] = books.filter(book =>
                book.categories.some(c => c.id === cat.id)
            );
        });
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-8 flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-orange-600" />
                Library Categories
            </h1>

            <div className="grid grid-cols-1 gap-8">
                {categoriesDisplay.map((category) => {
                    const categoryBooks = booksByCategory[category.name] || [];

                    if (categoryBooks.length === 0) return null; // Optional: Hide empty categories

                    return (
                        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-orange-50/30">
                                <Link href={`/categories/${category.id}`} className="group flex items-center gap-3 hover:text-orange-700 transition-colors">
                                    <div
                                        className="w-4 h-4 rounded-full shadow-sm ring-1 ring-black/5"
                                        style={{ backgroundColor: category.color || '#cbd5e1' }}
                                    />
                                    <h2 className="text-xl font-semibold text-stone-900 group-hover:text-orange-700">
                                        {category.name}
                                    </h2>
                                    <span className="text-sm text-stone-500 font-normal">
                                        ({categoryBooks.length} books)
                                    </span>
                                </Link>
                                <Link
                                    href={`/categories/${category.id}`}
                                    className="text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {categoryBooks.slice(0, 4).map(book => (
                                        <Link
                                            key={book.id}
                                            href={`/books/${book.id}`}
                                            className="group flex gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100"
                                        >
                                            <div className="w-12 h-16 bg-stone-200 rounded shrink-0 overflow-hidden relative shadow-sm">
                                                {book.coverImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                                        <Book className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-stone-900 truncate group-hover:text-orange-700 transition-colors">
                                                    {book.title}
                                                </h3>
                                                <p className="text-xs text-stone-500 truncate">
                                                    {book.author.name}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
