import { getAuthors } from '@/app/actions/authors';
import AuthorList from '@/app/components/AuthorList';
import { Search } from 'lucide-react';

export default async function AuthorsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params.q;
    
    const { success, authors, error } = await getAuthors({ query });

    if (!success || !authors) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 text-red-600 max-w-7xl mx-auto">
                Error loading authors: {error}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authors</h1>
                        <p className="text-gray-600">Browse all authors in your library</p>
                    </div>

                    <form className="relative max-w-md w-full" action="/authors" method="GET">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search authors..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                        />
                    </form>
                </div>

                <AuthorList authors={authors} />
            </div>
        </main>
    );
}
