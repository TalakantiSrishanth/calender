import './globals.css';

export const metadata = {
  title: 'Calendar',
  description: 'Calendar with ranged selection',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}