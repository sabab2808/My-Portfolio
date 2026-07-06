import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Md. Sadman Al Islam Shabab | Portfolio',
  description: 'A modern, animated portfolio built with Next.js for a full-stack developer and CSE student.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="page-transition-layer" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
