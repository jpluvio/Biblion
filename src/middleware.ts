import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    // Protect all routes EXCEPT api routes, standard Next.js paths, favicon, and the login page itself
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|welcome).*)"]
};
