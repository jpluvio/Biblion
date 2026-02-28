import { hasAnyUsers } from '../actions/setup';
import { redirect } from 'next/navigation';
import LoginForm from '../components/LoginForm';

export const metadata = {
    title: 'Sign in - Biblion',
};

export default async function LoginPage() {
    // If no users exist, force redirect to onboarding
    const hasUsers = await hasAnyUsers();
    if (!hasUsers) {
        redirect('/welcome');
    }

    return <LoginForm />;
}
