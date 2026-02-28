'use client';

import ExportButton from '@/app/components/data/ExportButton';
import ImportButton from '@/app/components/data/ImportButton';
import { Database, FileJson, FileSpreadsheet } from 'lucide-react';
import BackupSettingsForm from './BackupSettingsForm';

export default function SettingsPage() {
    return (
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-stone-900">System Settings</h1>
                    <p className="mt-2 text-stone-600">
                        Manage your library data, backups, and system preferences.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Data Management Section */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-stone-200">
                        <div className="px-4 py-5 sm:px-6 border-b border-stone-200 bg-stone-50">
                            <h3 className="text-lg leading-6 font-medium text-stone-900 flex items-center gap-2">
                                <Database className="w-5 h-5 text-stone-500" />
                                Data Management
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-stone-500">
                                Import and export your library data.
                            </p>
                        </div>
                        <div className="px-4 py-5 sm:p-6 space-y-8">

                            {/* Export Section */}
                            <div>
                                <h4 className="text-sm font-medium text-stone-900 mb-3">Export Data</h4>
                                <div className="bg-stone-50 rounded-md p-4 border border-stone-200">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileJson className="w-4 h-4 text-orange-600" />
                                                <span className="font-medium text-stone-700">JSON Backup (Recommended)</span>
                                            </div>
                                            <p className="text-sm text-stone-500 mb-3">
                                                Full backup including authors, categories, and reading history. Best for migrating to another instance or restoring data.
                                            </p>
                                            <ExportButton format="json" />
                                        </div>
                                        <div className="hidden sm:block w-px bg-stone-200"></div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                                <span className="font-medium text-stone-700">CSV Export</span>
                                            </div>
                                            <p className="text-sm text-stone-500 mb-3">
                                                Simplified spreadsheet format. Useful for reporting or viewing in Excel. Detailed relationships might be flattened.
                                            </p>
                                            <ExportButton format="csv" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-stone-100" />

                            {/* Import Section */}
                            <div>
                                <h4 className="text-sm font-medium text-stone-900 mb-3">Import Data</h4>
                                <div className="bg-stone-50 rounded-md p-4 border border-stone-200">
                                    <p className="text-sm text-stone-500 mb-4">
                                        Import data from a previous JSON backup or a CSV file.
                                        Existing items with matching IDs (JSON) or ISBNs (CSV) will be updated.
                                        New items will be created.
                                    </p>
                                    <ImportButton />
                                </div>
                            </div>

                            <hr className="border-stone-100" />

                            {/* Backup Section */}
                            <div>
                                <h4 className="text-sm font-medium text-stone-900 mb-3">Automated Backups</h4>
                                <BackupSettingsForm />
                            </div>

                        </div>
                    </div>

                    {/* Future Settings Sections (Placeholders) */}
                    {/* 
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-stone-200 opacity-60">
                        <div className="px-4 py-5 sm:px-6 border-b border-stone-200 bg-stone-50">
                            <h3 className="text-lg leading-6 font-medium text-stone-900">
                                User Preferences
                            </h3>
                        </div>
                        <div className="px-4 py-5 sm:p-6 text-center text-stone-500 italic">
                            Coming soon...
                        </div>
                    </div>
                    */}
                </div>
            </div>
        </main>
    );
}
