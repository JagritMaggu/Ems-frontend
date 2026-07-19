import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from './StoreProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Employee Management System',
  description: 'Enterprise Employee Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <StoreProvider>
            {children}
            <Toaster position="top-right" toastOptions={{ 
              style: { 
                background: 'var(--card-bg)', 
                color: 'var(--text-main)', 
                border: '1px solid var(--border)' 
              } 
            }} />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
