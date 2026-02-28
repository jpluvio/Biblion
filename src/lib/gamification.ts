const XP_EVENTS = {
    READ_BOOK: 100,
    ADD_BOOK: 10,
    ADD_REVIEW: 20,
};

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (stats: any) => boolean;
}

export function calculateLevel(xp: number): { level: number; progress: number; nextLevelXp: number } {
    // Simple curve: Level = floor(sqrt(XP / 100)) + 1
    // Level 1: 0-99 XP
    // Level 2: 100-399 XP
    // Level 3: 400-899 XP
    // etc.
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
    const nextLevelBaseXp = Math.pow(level, 2) * 100;

    const xpInLevel = xp - currentLevelBaseXp;
    const xpNeededForLevel = nextLevelBaseXp - currentLevelBaseXp;

    const progress = Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));

    return {
        level,
        progress,
        nextLevelXp: nextLevelBaseXp
    };
}

export const BADGES: Badge[] = [
    {
        id: 'newbie',
        name: 'Newcomer',
        description: 'Joined the library',
        icon: '👋',
        condition: () => true // Always unlocked for now if they exist
    },
    {
        id: 'bookworm',
        name: 'Bookworm',
        description: 'Read 10 books',
        icon: '🐛',
        condition: (stats) => stats.totalRead >= 10
    },
    {
        id: 'bibliophile',
        name: 'Bibliophile',
        description: 'Read 50 books',
        icon: '📚',
        condition: (stats) => stats.totalRead >= 50
    },
    {
        id: 'librarian',
        name: 'Librarian',
        description: 'Own 100 books',
        icon: '🏛️',
        condition: (stats) => stats.totalBooks >= 100
    },
    {
        id: 'dedicated',
        name: 'Dedicated Reader',
        description: 'Read a book this year',
        icon: '📅',
        condition: (stats) => {
            const currentYear = new Date().getFullYear().toString();
            return stats.activityData.some((d: any) => d.year === currentYear && d.count > 0);
        }
    }
];
