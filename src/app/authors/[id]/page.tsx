import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BookList from '@/app/components/BookList';
import AuthorBio from '@/app/components/authors/AuthorBio';
import AuthorGenderEditor from '@/app/components/authors/AuthorGenderEditor';
import { Suspense } from 'react';
import { BookOpen, User } from 'lucide-react';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const author = await prisma.author.findUnique({
        where: { id },
    });
    return {
        title: author ? `${author.name} - Biblion` : 'Author Not Found',
    };
}

export default async function AuthorPage({ params }: Props) {
    const { id } = await params;
    const author = await prisma.author.findUnique({
        where: { id },
        include: {
            books: {
                orderBy: { publishYear: 'desc' },
                include: {
                    author: true,
                    categories: true,
                    readingStatuses: {
                        include: {
                            user: true
                        }
                    },
                }
            }
        }
    });

    if (!author) {
        notFound();
    }

    const totalPages = author.books.reduce((acc, book) => acc + (book.pages || 0), 0);
    const avgPages = author.books.length > 0 ? Math.round(totalPages / author.books.length) : 0;

    return (
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Sidebar: Bio & Stats */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="bg-white shadow rounded-lg p-6 border border-stone-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-stone-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-stone-900 leading-tight">{author.name}</h1>
                                <AuthorGenderEditor authorId={author.id} initialGender={author.gender} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 mb-6">
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-stone-800">{author.books.length}</span>
                                <span className="text-xs text-stone-500 uppercase tracking-wide">Books</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-bold text-stone-800">{avgPages}</span>
                                <span className="text-xs text-stone-500 uppercase tracking-wide">Avg Pages</span>
                            </div>
                        </div>

                        <div className="border-t border-stone-100 pt-4">
                            <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Biography
                            </h3>
                            <Suspense fallback={<div className="h-20 bg-stone-100 animate-pulse rounded"></div>}>
                                <AuthorBio author={author as any} />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Right Content: Books */}
                <div className="w-full md:w-2/3">
                    <h2 className="text-xl font-bold text-stone-900 mb-4">Bibliography</h2>
                    {author.books.length > 0 ? (
                        <BookList books={author.books as any} />
                    ) : (
                        <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                            <p className="text-stone-500">No books found for this author in your library.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
