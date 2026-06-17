import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "linkedin.com",
  description: "Educational demonstration of publicly exposed directory profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                  <img src="/2673777.webp" alt="Logo" className="h-8 w-auto object-contain" />
                  <span className="text-slate-800 font-semibold tracking-tight">Directory</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                  {/* <Link href="/" className="hover:text-blue-600 transition-colors">Directory</Link> */}
                  <Link href="/analytics" className="hover:text-blue-600 transition-colors">Platform Analytics</Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Public API Live
                </span> */}
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="border-t border-slate-200 bg-white py-6">
            <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
              <p>&copy; {new Date().getFullYear()} LinkedIn Scraping Simulation Platform. Strictly for Educational Cybersecurity Demos.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

