import { Prisma } from '@prisma/client';

// Define the exact structure returned by our server actions
export type BookWithRelations = Prisma.BookGetPayload<{
    include: {
        author: true;
        categories: true;
        location: true;
        readingStatuses: {
            select: {
                status: true;
                userId: true;
            };
        };
        loans: {
            where: { returnedAt: null };
            select: {
                id: true;
                user: {
                    select: { id: true };
                };
            };
        };
    };
}>;
