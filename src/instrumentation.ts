export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { PrismaClient } = await import('@prisma/client');
        const fs = await import('fs');
        const path = await import('path');

        console.log('🤖 Running startup routines...');

        try {
            const prisma = new PrismaClient();
            const config = await prisma.setting.findUnique({
                where: { key: 'backupPath' }
            });

            if (config && config.value) {
                const backupDir = config.value;
                const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

                if (fs.existsSync(dbPath)) {
                    if (!fs.existsSync(backupDir)) {
                        fs.mkdirSync(backupDir, { recursive: true });
                    }

                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const backupFileName = `auto-startup-backup-${timestamp}.db`;
                    const destPath = path.join(backupDir, backupFileName);

                    fs.copyFileSync(dbPath, destPath);
                    console.log(`✅ Automatic startup backup created: ${destPath}`);
                }
            } else {
                console.log('⚠️ Automatic backup skipped: No backup path configured in settings.');
            }

            await prisma.$disconnect();
        } catch (error) {
            console.error('❌ Failed to run startup backup routine:', error);
        }
    }
}
