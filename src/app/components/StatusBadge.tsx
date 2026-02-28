'use client';

import { useState } from 'react';
import { updateReadingStatus } from '../actions/status';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useConfetti } from './ui/ConfettiCelebration';
import { useToast } from './ui/ToastProvider';

type Props = {
    bookId: string;
    currentStatus?: string;
    activeReader?: string | null;
};

const STATUS_OPTIONS = ['To read', 'To study', 'Reading', 'Studying', 'Read', 'Paused', 'Dropped'];

export default function StatusBadge({ bookId, currentStatus = 'To read', activeReader }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();
    const fireConfetti = useConfetti();
    const toast = useToast();

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        setIsUpdating(true);
        const res = await updateReadingStatus(bookId, newStatus);

        if (res.success) {
            if (newStatus === 'Read') {
                fireConfetti();
                toast.success('Good Job! 🎉 Book completed!');
            }
            router.refresh();
        } else {
            toast.error(res.error || 'Failed to update status');
        }
        setIsUpdating(false);
    };

    if (activeReader && currentStatus !== 'Reading') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200" title={`Currently active reader: ${activeReader}`}>
                Reading by {activeReader}
            </span>
        );
    }

    if (currentStatus === 'Lent') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-not-allowed" title="Book is currently lent out. Return it to change status.">
                Lent Out
            </span>
        );
    }

    return (
        <div className="relative inline-block text-left">
            {isUpdating ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Updating...
                </span>
            ) : (
                <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`appearance-none block w-full px-2 py-1 text-xs font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${currentStatus === 'Reading' ? 'bg-green-100 text-green-800 border-green-200' :
                        currentStatus === 'Studying' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                            currentStatus === 'To study' ? 'bg-cyan-100 text-cyan-800 border-cyan-200' :
                                currentStatus === 'Read' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    currentStatus === 'Paused' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                        currentStatus === 'Dropped' ? 'bg-red-100 text-red-800 border-red-200' :
                                            currentStatus === 'Lent' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                                'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                >
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
