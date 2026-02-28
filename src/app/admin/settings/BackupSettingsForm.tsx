'use client';

import { useState, useEffect } from 'react';
import { getSetting, updateSetting, triggerManualBackup } from '@/app/actions/settings';
import { HardDrive, Save, RefreshCw } from 'lucide-react';

export default function BackupSettingsForm() {
    const [backupPath, setBackupPath] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        getSetting('backupPath').then(res => {
            if (res.success && res.value) {
                setBackupPath(res.value);
            }
            setIsLoading(false);
        });
    }, []);

    const handleSavePath = async () => {
        setIsSaving(true);
        setMessage(null);

        const res = await updateSetting('backupPath', backupPath);
        if (res.success) {
            setMessage({ type: 'success', text: 'Backup path saved successfully' });
        } else {
            setMessage({ type: 'error', text: res.error || 'Failed to save path' });
        }
        setIsSaving(false);
    };

    const handleBackupNow = async () => {
        if (!backupPath) {
            setMessage({ type: 'error', text: 'Please configure and save a backup path first' });
            return;
        }

        setIsBackingUp(true);
        setMessage(null);

        const res = await triggerManualBackup();
        if (res.success) {
            setMessage({ type: 'success', text: res.message || 'Backup successful' });
        } else {
            setMessage({ type: 'error', text: res.error || 'Backup failed' });
        }
        setIsBackingUp(false);
    };

    if (isLoading) {
        return <div className="animate-pulse flex space-x-4 h-10 w-full bg-stone-100 rounded"></div>;
    }

    return (
        <div className="bg-stone-50 rounded-md p-4 border border-stone-200">
            <h4 className="flex items-center gap-2 font-medium text-stone-900 mb-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Database Backup
            </h4>
            <p className="text-sm text-stone-500 mb-4">
                Configure a local folder path where the database backups will be saved automatically on application start, or manually triggered.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <label htmlFor="backupPath" className="sr-only">Backup Folder Path</label>
                    <input
                        type="text"
                        id="backupPath"
                        value={backupPath}
                        onChange={(e) => setBackupPath(e.target.value)}
                        placeholder="/absolute/path/to/backups/folder"
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button
                    onClick={handleSavePath}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-white text-stone-700 border border-stone-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Path
                </button>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm">
                    {message && (
                        <span className={message.type === 'error' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                            {message.text}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleBackupNow}
                    disabled={isBackingUp || !backupPath}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                    Backup Now
                </button>
            </div>
        </div>
    );
}
