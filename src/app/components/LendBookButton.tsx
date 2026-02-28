'use client';

import { useState } from 'react';
import { lendBook } from '@/app/actions/loans';
import { UserPlus, X, Check } from 'lucide-react';

interface LendBookButtonProps {
    bookId: string;
}

export default function LendBookButton({ bookId }: LendBookButtonProps) {
    const [isLending, setIsLending] = useState(false);
    const [borrowerName, setBorrowerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleLend() {
        if (!borrowerName.trim()) return;

        setIsLoading(true);
        const result = await lendBook(bookId, borrowerName);
        setIsLoading(false);

        if (result.success) {
            setIsLending(false);
            setBorrowerName('');
        } else {
            alert(result.error);
        }
    }

    if (isLending) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input
                    type="text"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="Borrower's Name"
                    className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleLend();
                        if (e.key === 'Escape') setIsLending(false);
                    }}
                />
                <button
                    onClick={handleLend}
                    disabled={isLoading || !borrowerName.trim()}
                    className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    <Check className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setIsLending(false)}
                    className="inline-flex items-center p-1.5 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsLending(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <UserPlus className="h-4 w-4 mr-2" />
            Lend Book
        </button>
    );
}
