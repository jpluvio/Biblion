import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import Navbar from "./components/Navbar";
import ToastProvider from "./components/ui/ToastProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Biblion",
    description: "Manage your home library",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
            <body className={inter.className}>
                <NextAuthProvider>
                    <ToastProvider>
                        <Navbar />
                        {children}
                    </ToastProvider>
                </NextAuthProvider>
                <SpeedInsights />
            </body>
        </html>
    );
}
