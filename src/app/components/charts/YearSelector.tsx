'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

interface Props {
    currentYear: number;
}

export default function YearSelector({ currentYear }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const handleYearChange = (offset: number) => {
        const newYear = currentYear + offset;
        router.push(pathname + '?' + createQueryString('year', newYear.toString()), { scroll: false });
    };

    return (
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <button
                onClick={() => handleYearChange(-1)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                aria-label="Previous Year"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-lg font-bold text-gray-900 min-w-[3rem] text-center">
                {currentYear}
            </span>

            <button
                onClick={() => handleYearChange(1)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                aria-label="Next Year"
                disabled={currentYear >= new Date().getFullYear()} // Optional: disable future? User didn't ask, but good UX. Let's effectively allow future for planning? Specs don't say. Let's allow.
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
