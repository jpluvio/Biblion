'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Invalid credentials');
                return;
            }

            router.push('/');
            router.refresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" >
            <div className="sm:mx-auto sm:w-full sm:max-w-md" >
                <div className="flex justify-center" >
                    <BookOpen className="h-12 w-12 text-orange-500" />
                </div>
                < h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900" >
                    Sign in to Biblion
                </h2>
            </div>

            < div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" >
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10" >
                    <form className="space-y-6" onSubmit={handleSubmit} >
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded" >
                                {error}
                            </div>
                        )
                        }

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-700" >
                                Email address
                            </label>
                            < div className="mt-1" >
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        < div >
                            <label htmlFor="password" className="block text-sm font-medium text-stone-700" >
                                Password
                            </label>
                            < div className="mt-1" >
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        < div >
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
