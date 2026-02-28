const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Biblion Public Repository Database...');

    // 1. Setup Admin User
    const existingUser = await prisma.user.findUnique({ where: { email: 'admin@biblion.local' } });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('secret123', 10);
        await prisma.user.create({
            data: {
                name: 'Biblion Admin',
                email: 'admin@biblion.local',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log('Created test Admin user (admin@biblion.local / secret123)');
    }

    // 2. Setup Categories
    const categories = [
        { name: 'Fiction', color: '#3b82f6', icon: 'Book' },
        { name: 'Non-Fiction', color: '#ef4444', icon: 'BookOpen' },
        { name: 'Sci-Fi', color: '#8b5cf6', icon: 'Rocket' },
        { name: 'Fantasy', color: '#10b981', icon: 'Wand2' },
        { name: 'Philosophy', color: '#f59e0b', icon: 'Brain' },
        { name: 'History', color: '#78716c', icon: 'Hourglass' },
    ];

    const categoryMap = {};
    for (const cat of categories) {
        const createdCat = await prisma.category.upsert({
            where: { name: cat.name },
            update: cat,
            create: cat,
        });
        categoryMap[cat.name] = createdCat.id;
    }
    console.log('Created test Categories');

    // 3. Setup Test Books (15 Books)
    const books = [
        {
            title: "Dune",
            authorName: "Frank Herbert",
            isbn: "9780441172719",
            pages: 896,
            publishYear: 1965,
            language: "English",
            description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides...",
            categoryNames: ["Sci-Fi", "Fiction"]
        },
        {
            title: "1984",
            authorName: "George Orwell",
            isbn: "9780451524935",
            pages: 328,
            publishYear: 1949,
            language: "English",
            description: "Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real...",
            categoryNames: ["Fiction", "Sci-Fi"]
        },
        {
            title: "Neuromancer",
            authorName: "William Gibson",
            isbn: "9780441569595",
            pages: 271,
            publishYear: 1984,
            language: "English",
            description: "The Matrix is a world within the world, a global consensus-hallucination...",
            categoryNames: ["Sci-Fi"]
        },
        {
            title: "The Hobbit",
            authorName: "J.R.R. Tolkien",
            isbn: "9780547928227",
            pages: 366,
            publishYear: 1937,
            language: "English",
            description: "A great modern classic and the prelude to The Lord of the Rings.",
            categoryNames: ["Fantasy", "Fiction"]
        },
        {
            title: "Meditations",
            authorName: "Marcus Aurelius",
            isbn: "9780812968255",
            pages: 256,
            publishYear: 180,
            language: "English",
            description: "The writings of Marcus Aurelius on Stoic philosophy.",
            categoryNames: ["Philosophy", "Non-Fiction"]
        },
        {
            title: "Sapiens: A Brief History of Humankind",
            authorName: "Yuval Noah Harari",
            isbn: "9780062316097",
            pages: 464,
            publishYear: 2011,
            language: "English",
            description: "From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution...",
            categoryNames: ["History", "Non-Fiction"]
        },
        {
            title: "Foundation",
            authorName: "Isaac Asimov",
            isbn: "9780553293357",
            pages: 244,
            publishYear: 1951,
            language: "English",
            description: "For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying.",
            categoryNames: ["Sci-Fi", "Fiction"]
        },
        {
            title: "The Name of the Wind",
            authorName: "Patrick Rothfuss",
            isbn: "9780756404741",
            pages: 662,
            publishYear: 2007,
            language: "English",
            description: "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
            categoryNames: ["Fantasy", "Fiction"]
        },
        {
            title: "SPQR: A History of Ancient Rome",
            authorName: "Mary Beard",
            isbn: "9780871404237",
            pages: 608,
            publishYear: 2015,
            language: "English",
            description: "In SPQR, an instant classic, Mary Beard narrates the history of Rome with passion and without technical jargon.",
            categoryNames: ["History", "Non-Fiction"]
        },
        {
            title: "Beyond Good and Evil",
            authorName: "Friedrich Nietzsche",
            isbn: "9780140449235",
            pages: 240,
            publishYear: 1886,
            language: "English",
            description: "Nietzsche discusses how past philosophers were lacking in critical sense and blindly accepted dogmas.",
            categoryNames: ["Philosophy", "Non-Fiction"]
        },
        {
            title: "Snow Crash",
            authorName: "Neal Stephenson",
            isbn: "9780553380965",
            pages: 480,
            publishYear: 1992,
            language: "English",
            description: "In reality, Hiro Protagonist delivers pizza for Uncle Enzo's CosoNostra Pizza Inc., but in the Metaverse he's a warrior prince.",
            categoryNames: ["Sci-Fi", "Fiction"]
        },
        {
            title: "Guns, Germs, and Steel",
            authorName: "Jared Diamond",
            isbn: "9780393317558",
            pages: 528,
            publishYear: 1997,
            language: "English",
            description: "The fates of human societies...",
            categoryNames: ["History", "Non-Fiction"]
        },
        {
            title: "The Republic",
            authorName: "Plato",
            isbn: "9780140455113",
            pages: 416,
            publishYear: -375,
            language: "English",
            description: "Plato's dialogues concerning justice, the order and character of the just city-state, and the just man.",
            categoryNames: ["Philosophy", "Non-Fiction"]
        },
        {
            title: "The Lord of the Rings",
            authorName: "J.R.R. Tolkien",
            isbn: "9780544003415",
            pages: 1178,
            publishYear: 1954,
            language: "English",
            description: "The complete epic fantasy novel in one volume.",
            categoryNames: ["Fantasy", "Fiction"]
        },
        {
            title: "Frankenstein",
            authorName: "Mary Shelley",
            isbn: "9780486282114",
            pages: 166,
            publishYear: 1818,
            language: "English",
            description: "Victor Frankenstein, an unorthodox young scientist, creates a grotesque but sapient creature in an unorthodox scientific experiment.",
            categoryNames: ["Sci-Fi", "Fiction"]
        }
    ];

    for (const bookData of books) {
        // Upsert Author
        let author = await prisma.author.findFirst({ where: { name: bookData.authorName } });
        if (!author) {
            author = await prisma.author.create({ data: { name: bookData.authorName } });
        }

        // Upsert Book
        const existingBook = await prisma.book.findFirst({ where: { isbn: bookData.isbn } });
        if (!existingBook) {
            await prisma.book.create({
                data: {
                    title: bookData.title,
                    authorId: author.id,
                    isbn: bookData.isbn,
                    pages: bookData.pages,
                    publishYear: bookData.publishYear,
                    language: bookData.language,
                    description: bookData.description,
                    categories: {
                        connect: bookData.categoryNames.map(name => ({ id: categoryMap[name] }))
                    }
                }
            });
        }
    }
    console.log('Created 15 test books.');

    console.log('Database seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
