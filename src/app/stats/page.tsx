import { getLibraryStats } from '@/app/actions/stats';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import StatCard from '@/app/components/charts/StatCard';
import InteractiveChartsGrid from '@/app/components/charts/InteractiveChartsGrid';
import UserProgress from '@/app/components/gamification/UserProgress';
import BadgeList from '@/app/components/gamification/BadgeList';
import BookSuggestion from '@/app/components/suggestions/BookSuggestion';
import { Book, CheckCircle, Clock, BookOpen, GraduationCap } from 'lucide-react';
import StatsFilter from '@/app/components/charts/StatsFilter';
import NutritionPieChart from '@/app/components/NutritionPieChart';
import { getBooks } from '@/app/actions/books';
import { getCategories, CategoryWithChildren } from '@/app/actions/categories';

export default async function StatsPage({
    searchParams,
}: {
    searchParams: Promise<{ scope?: string; year?: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/login');

    const params = await searchParams;
    const scope = (params.scope as 'all' | 'owned') || 'all';
    const currentYear = parseInt(params.year || new Date().getFullYear().toString());

    const [
        userData,
        booksForChart,
        { categories },
        { success, stats, error }
    ] = await Promise.all([
        prisma.user.findUnique({
            where: { email: session.user?.email || '' },
            select: { xp: true, name: true }
        }),
        prisma.book.findMany({
            select: { categories: { select: { id: true } } }
        }),
        getCategories(),
        getLibraryStats(scope, currentYear)
    ]);

    if (!success || !stats) {
        // ... error handling
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto text-red-600">
                    Error loading statistics: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 px-2 sm:px-0">Library Analytics</h1>

                {userData && (
                    <div className="mb-8">
                        <UserProgress xp={userData.xp} userName={userData.name} />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 mb-8">
                    <div className="w-full">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
                        <BadgeList stats={stats} />
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended</h2>
                    <BookSuggestion />
                </div>

                <StatsFilter />

                {categories && (
                    <div className="mb-6 sm:mb-8 px-2 sm:px-0">
                        <NutritionPieChart books={booksForChart} categories={categories as CategoryWithChildren[]} />
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
                    <StatCard
                        title={scope === 'owned' ? "Owned Books" : "Total Library"}
                        value={stats.totalBooks}
                        icon={Book}
                        description={scope === 'owned' ? "Books you own" : "All books with status"}
                    />
                    <StatCard
                        title="Books Read"
                        value={stats.totalRead}
                        icon={CheckCircle}
                        description="Completed reading journeys"
                    />
                    <StatCard
                        title="To Read"
                        value={stats.totalToRead}
                        icon={Clock}
                        description="Books waiting for you"
                    />
                    <StatCard
                        title="Currently Reading"
                        value={stats.totalReading}
                        icon={BookOpen}
                        description="Active reading sessions"
                    />
                    <StatCard
                        title="Currently Studying"
                        value={stats.totalStudying}
                        icon={GraduationCap}
                        description="Active study sessions"
                    />
                </div>

                {/* Charts Grid - Wrapped in a single Client Component for interactivity */}
                <InteractiveChartsGrid stats={stats} currentYear={currentYear} />
            </div>
        </div>
    );
}
