'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[200]" onClick={onCancel}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full shrink-0 ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>
                        </div>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for easy usage
export function useConfirmDialog() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: 'danger' | 'warning';
        onConfirm: () => void;
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const confirm = useCallback((opts: {
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: 'danger' | 'warning';
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                open: true,
                ...opts,
                onConfirm: () => {
                    setState(prev => ({ ...prev, open: false }));
                    resolve(true);
                },
            });
        });
    }, []);

    const cancel = useCallback(() => {
        setState(prev => ({ ...prev, open: false }));
    }, []);

    const dialogProps: ConfirmDialogProps = {
        open: state.open,
        title: state.title,
        message: state.message,
        confirmLabel: state.confirmLabel,
        variant: state.variant,
        onConfirm: state.onConfirm,
        onCancel: cancel,
    };

    return { confirm, dialogProps };
}
