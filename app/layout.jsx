import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const metadata = {
    title: "Smart Bookmarks",
    description: "Manage your bookmarks across devices",
};

export default function RootLayout({
    children,
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} font-sans`}>{children}</body>
        </html>
    );
}
