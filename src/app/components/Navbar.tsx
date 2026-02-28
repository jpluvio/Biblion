'use client';

import { useSession, signOut } from 'next-auth/react';
import { BookOpen, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, Suspense } from 'react';
import SearchBar from './SearchBar';

export default function Navbar() {
    const { data: session } = useSession();

    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const isActive = (path: string) => pathname === path;

    const linkClass = (path: string) =>
        `text-sm font-medium transition-colors ${isActive(path)
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`;

    const mobileLinkClass = (path: string) =>
        `block px-3 py-2 rounded-md text-base font-medium ${isActive(path)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`;

    return (
        <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <Link href="/" className="text-xl font-bold text-foreground tracking-tight">
                            Home Library
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="w-64">
                            <Suspense>
                                <SearchBar />
                            </Suspense>
                        </div>
                        {session ? (
                            <>
                                <Link href="/my-books" className={linkClass('/my-books')}>
                                    My Books
                                </Link>
                                <Link href="/authors" className={linkClass('/authors')}>
                                    Authors
                                </Link>
                                <Link href="/stats" className={linkClass('/stats')}>
                                    Statistics
                                </Link>
                                <Link href="/profile" className={linkClass('/profile')}>
                                    Profile
                                </Link>
                                {session.user?.role === 'ADMIN' && (
                                    <div className="relative group">
                                        <button className={`${linkClass('/admin')} flex items-center gap-1`}>
                                            Settings
                                        </button>
                                        <div className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                                            <div className="py-1">
                                                <Link href="/admin/users" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                                    Users
                                                </Link>
                                                <Link href="/admin/categories" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                                    Categories
                                                </Link>
                                                <Link href="/admin/locations" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                                    Locations
                                                </Link>
                                                <div className="border-t border-border my-1"></div>
                                                <Link href="/admin/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                                                    App Settings
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="h-4 w-px bg-border mx-2" />

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    <span>{session.user?.name?.split(' ')[0] || 'User'}</span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80">
                                Sign in
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-muted-foreground hover:text-foreground p-2"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {session ? (
                            <>
                                <div className="px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/50 rounded-md mb-2 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    {session.user?.name || session.user?.email}
                                </div>
                                <Link href="/my-books" className={mobileLinkClass('/my-books')} onClick={toggleMenu}>
                                    My Books
                                </Link>
                                <Link href="/authors" className={mobileLinkClass('/authors')} onClick={toggleMenu}>
                                    Authors
                                </Link>
                                <Link href="/stats" className={mobileLinkClass('/stats')} onClick={toggleMenu}>
                                    Statistics
                                </Link>
                                <Link href="/profile" className={mobileLinkClass('/profile')} onClick={toggleMenu}>
                                    Profile
                                </Link>
                                {session.user?.role === 'ADMIN' && (
                                    <>
                                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase mt-4">
                                            Admin
                                        </div>
                                        <Link href="/admin/users" className={mobileLinkClass('/admin/users')} onClick={toggleMenu}>
                                            Users
                                        </Link>
                                        <Link href="/admin/categories" className={mobileLinkClass('/admin/categories')} onClick={toggleMenu}>
                                            Categories
                                        </Link>
                                        <Link href="/admin/locations" className={mobileLinkClass('/admin/locations')} onClick={toggleMenu}>
                                            Locations
                                        </Link>
                                        <Link href="/admin/settings" className={mobileLinkClass('/admin/settings')} onClick={toggleMenu}>
                                            Settings
                                        </Link>
                                    </>
                                )}
                                <div className="border-t border-border my-2 pt-2">
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link href="/login" className={mobileLinkClass('/login')} onClick={toggleMenu}>
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
