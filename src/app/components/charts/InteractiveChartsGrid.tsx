'use client';

import { useState } from 'react';
import GenderPieChart from '@/app/components/charts/GenderPieChart';
import StatusDistributionChart from '@/app/components/charts/StatusDistributionChart';
import CategoryDistributionChart from '@/app/components/charts/CategoryDistributionChart';
import ReadingActivityChart from '@/app/components/charts/ReadingActivityChart';
import BooksAddedChart from '@/app/components/charts/BooksAddedChart';
import LanguageDistributionChart from '@/app/components/charts/LanguageDistributionChart';
import YearSelector from '@/app/components/charts/YearSelector';
import InteractiveChartModal from '@/app/components/charts/InteractiveChartModal';

export default function InteractiveChartsGrid({ stats, currentYear }: { stats: any, currentYear: number }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBookIds, setModalBookIds] = useState<string[]>([]);

    const handleSegmentClick = (title: string, bookIds: string[]) => {
        setModalTitle(title);
        setModalBookIds(bookIds);
        setModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 px-2 sm:px-0">
                {/* Status Distribution */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Reading Status Distribution</h2>
                    <StatusDistributionChart data={stats.statusData} onSegmentClick={(name, ids) => handleSegmentClick(`Status: ${name}`, ids)} />
                </div>

                {/* Gender Distribution */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Author Gender Distribution</h2>
                    <GenderPieChart data={stats.genderData} onSegmentClick={(name, ids) => handleSegmentClick(`Author Gender: ${name}`, ids)} />
                </div>

                {/* Language Distribution */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h2>
                    <LanguageDistributionChart data={stats.languageData} onSegmentClick={(name, ids) => handleSegmentClick(`Language: ${name}`, ids)} />
                </div>

                {/* Books Added per Month */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Books Added</h2>
                        <YearSelector currentYear={currentYear} />
                    </div>
                    <BooksAddedChart data={stats.booksAddedData} onSegmentClick={handleSegmentClick} />
                </div>

                {/* Category Distribution - Full Width */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
                    <CategoryDistributionChart data={stats.categoryData} onSegmentClick={(name, ids) => handleSegmentClick(`Category: ${name}`, ids)} />
                </div>

                {/* Reading Activity - Full Width */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Books Read per Year</h2>
                    <ReadingActivityChart data={stats.activityData} onSegmentClick={handleSegmentClick} />
                </div>
            </div>

            <InteractiveChartModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                bookIds={modalBookIds}
            />
        </>
    );
}
