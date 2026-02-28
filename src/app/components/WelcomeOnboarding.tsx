'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Library, TrendingUp, ChevronRight, ChevronLeft, UserPlus, CheckCircle2 } from 'lucide-react';
import { setupFirstUser } from '../actions/setup';

export default function WelcomeOnboarding() {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const slides = [
        {
            title: "Welcome to Biblion",
            description: "Your simple, elegant solution for managing your personal book collection.",
            icon: <BookOpen className="w-20 h-20 text-orange-500 mb-6" />,
            color: "bg-orange-100/50"
        },
        {
            title: "Organize with Ease",
            description: "Categorize, track locations, and instantly find any book in your collection.",
            icon: <Library className="w-20 h-20 text-amber-500 mb-6" />,
            color: "bg-amber-100/50"
        },
        {
            title: "Track Reading & Loans",
            description: "Keep tabs on what you're reading, earn badges, and manage borrowed books.",
            icon: <TrendingUp className="w-20 h-20 text-orange-400 mb-6" />,
            color: "bg-orange-50"
        },
        {
            title: "Let's Get Started",
            description: "Create your admin account to initialize the database and begin your journey.",
            icon: <UserPlus className="w-16 h-16 text-stone-600 mb-4" />,
            color: "bg-stone-100/50"
        }
    ];

    const nextStep = () => setStep((s) => Math.min(s + 1, slides.length - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await setupFirstUser(formData);

        if (result.success) {
            router.push('/login');
        } else {
            setError(result.error || 'Failed to complete setup');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative min-h-[500px] flex flex-col">
            {/* Progress indicators */}
            <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-orange-500' : 'w-2 bg-stone-300'}`}
                    />
                ))}
            </div>

            {/* Slides Container */}
            <div
                className="flex flex-1 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${step * 100}%)` }}
            >
                {slides.map((slide, i) => (
                    <div key={i} className={`min-w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center ${slide.color}`}>
                        {step === i && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
                                {slide.icon}
                                <h2 className="text-3xl font-extrabold text-stone-900 mb-4 tracking-tight">
                                    {slide.title}
                                </h2>
                                <p className="text-lg text-stone-600 max-w-md mx-auto">
                                    {slide.description}
                                </p>

                                {i === slides.length - 1 && (
                                    <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8 space-y-4 text-left">
                                        {error && (
                                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
                                                {error}
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="w-full rounded-xl border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2.5 bg-white/50 backdrop-blur-sm"
                                                placeholder="Librarian"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="w-full rounded-xl border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2.5 bg-white/50 backdrop-blur-sm"
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                minLength={6}
                                                className="w-full rounded-xl border-stone-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 px-4 py-2.5 bg-white/50 backdrop-blur-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-semibold shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-6"
                                        >
                                            {isSubmitting ? 'Setting up...' : 'Create Account & Start'}
                                            {!isSubmitting && <CheckCircle2 className="w-5 h-5" />}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Controls */}
            {step < slides.length - 1 && (
                <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-between items-center bg-transparent z-10">
                    <button
                        onClick={prevStep}
                        className={`p-2 rounded-full text-stone-500 hover:bg-stone-200/50 transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all active:scale-95 shadow-md"
                    >
                        {step === slides.length - 2 ? "Let's Start" : "Next"}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
