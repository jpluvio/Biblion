'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ fallbackHref = '/', label = 'Back to Library' }: { fallbackHref?: string; label?: string }) {
    return (
        <Link
            href={fallbackHref}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 cursor-pointer"
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {label}
        </Link>
    );
}
