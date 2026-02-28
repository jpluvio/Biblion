'use client';

import { useState } from 'react';
import { exportData } from '@/app/actions/data';
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ExportButtonProps {
    format: 'json' | 'csv';
}

export default function ExportButton({ format }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const result = await exportData(format);

            if (result.success && result.data) {
                // Create a blob and download
                const blob = new Blob([result.data], {
                    type: format === 'json' ? 'application/json' : 'text/csv'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename || `export.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Export failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('An unexpected error occurred during export.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 rounded-md hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : format === 'json' ? (
                <FileJson className="w-4 h-4 text-orange-600" />
            ) : (
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
            )}
            <span className="font-medium">Export {format.toUpperCase()}</span>
        </button>
    );
}
