import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
    url: `${process.env.DATABASE_URL}`,
    authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function migrateImages() {
    console.log('Fetching books with local cover images...');

    // Find all books where coverImage starts with /uploads/
    const booksToUpdate = await prisma.book.findMany({
        where: {
            coverImage: {
                startsWith: '/uploads/',
            },
        },
        select: {
            id: true,
            title: true,
            coverImage: true,
        },
    });

    console.log(`Found ${booksToUpdate.length} books to migrate.`);

    let successCount = 0;
    let failCount = 0;

    for (const book of booksToUpdate) {
        if (!book.coverImage) continue;

        const fileName = book.coverImage.replace('/uploads/', '');
        const localFilePath = path.join(process.cwd(), 'public', 'uploads', fileName);

        try {
            if (fs.existsSync(localFilePath)) {
                console.log(`Processing: "${book.title}" (${fileName})`);

                // Read file and convert to base64
                const fileBuffer = fs.readFileSync(localFilePath);

                // Determine mime type from extension
                const ext = path.extname(fileName).toLowerCase();
                let mimeType = 'image/jpeg';
                if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.gif') mimeType = 'image/gif';
                else if (ext === '.webp') mimeType = 'image/webp';

                const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

                // Save to Turso
                await prisma.book.update({
                    where: { id: book.id },
                    data: { coverImage: base64Data }
                });

                successCount++;
            } else {
                console.warn(`File not found for "${book.title}": ${localFilePath}`);
                failCount++;
            }
        } catch (error) {
            console.error(`Error processing "${book.title}":`, error);
            failCount++;
        }
    }

    console.log(`\nMigration completed.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed/Not Found: ${failCount}`);

    await prisma.$disconnect();
}

migrateImages().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
