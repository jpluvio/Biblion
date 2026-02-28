'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function StatsFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentScope = searchParams.get('scope') || 'all';

    const handleScopeChange = (scope: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('scope', scope);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => handleScopeChange('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentScope === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    All Library
                </button>
                <button
                    onClick={() => handleScopeChange('owned')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentScope === 'owned'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Owned Only
                </button>
            </div>
        </div>
    );
}
