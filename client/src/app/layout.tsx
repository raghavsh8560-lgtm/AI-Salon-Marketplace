import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/Toast';

export const metadata: Metadata = {
  title: 'SalonAI - Premium AI Beauty & Salon Discovery Platform',
  description: 'Book top-rated hair, skincare, and bridal salons in Jaipur. Get personalized consults from our Gemini AI Assistant.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-primary/20 selection:text-primary no-scrollbar">
        <Providers>
          <Navbar />
          <main className="flex-1 bg-brand-bg dark:bg-gray-950 transition-colors duration-200">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
