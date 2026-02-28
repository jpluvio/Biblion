import { hasAnyUsers } from '../actions/setup';
import { redirect } from 'next/navigation';
import WelcomeOnboarding from '../components/WelcomeOnboarding';

export const metadata = {
    title: 'Welcome to Biblion',
};

export default async function WelcomePage() {
    let hasUsers = false;
    try {
        hasUsers = await hasAnyUsers();
    } catch (e) {
        // If DB is unreachable (e.g. during Vercel static build), assume false to allow page to render.
        // It will redirect properly at runtime when DB is real.
        console.warn('Could not check users during render:', e);
    }

    if (hasUsers) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
            <WelcomeOnboarding />
        </div>
    );
}
