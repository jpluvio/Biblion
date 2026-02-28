'use client';

import { useState, useRef } from 'react';
import { importData } from '@/app/actions/data';
import { Upload, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react';

export default function ImportButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string | null, stats?: any }>({ type: null, message: null });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset status
        setStatus({ type: null, message: null });
        setIsLoading(true);

        try {
            const format = file.name.endsWith('.json') ? 'json' : file.name.endsWith('.csv') ? 'csv' : null;

            if (!format) {
                setStatus({ type: 'error', message: 'Invalid file format. Please upload .json or .csv' });
                setIsLoading(false);
                return;
            }

            const content = await file.text();
            const result = await importData(content, format);

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: 'Import completed successfully!',
                    stats: result.stats
                });
            } else {
                setStatus({
                    type: 'error',
                    message: result.error || 'Import failed'
                });
            }
        } catch (error) {
            console.error('Import error:', error);
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-stone-500">
                        Accepts .json (full backup) or .csv (flat book list).
                    </p>
                    <button
                        onClick={() => {
                            const headers = ['Title', 'Author', 'ISBN', 'Language', 'Publish Year', 'Pages', 'Owner', 'Description', 'Categories', 'My Status'];
                            const example = ['The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'English', '1925', '180', 'Me', 'A classic novel.', 'Fiction; Classic', 'To read'];
                            const csvContent = [headers.join(','), example.join(',')].join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'library_import_template.csv';
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        <Download className="w-3 h-3" />
                        Download CSV Template
                    </button>
                </div>

                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json,.csv"
                        className="hidden"
                    />
                    <button
                        onClick={triggerUpload}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-50 rounded-md hover:bg-stone-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed w-full justify-center"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        <span className="font-medium">Import Data (JSON/CSV)</span>
                    </button>
                </div>
            </div>

            {status.message && (
                <div className={`p-4 rounded-md text-sm border ${status.type === 'success'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    <div className="flex items-start gap-2">
                        {status.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium">{status.message}</p>

                            {status.stats && (
                                <ul className="mt-2 text-xs space-y-1 ml-1 list-disc list-inside opacity-90">
                                    <li>Total items: {status.stats.total}</li>
                                    <li>Created/Updated: {status.stats.created}</li>
                                    <li>Failed: {status.stats.failed}</li>
                                    {status.stats.errors && status.stats.errors.length > 0 && (
                                        <li className="mt-2 text-red-600 font-semibold border-t border-red-200 pt-1">
                                            Errors:
                                            <ul className="list-none pl-0 mt-1 space-y-1 font-normal">
                                                {status.stats.errors.slice(0, 3).map((err: string, i: number) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                                {status.stats.errors.length > 3 && (
                                                    <li>...and {status.stats.errors.length - 3} more</li>
                                                )}
                                            </ul>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
