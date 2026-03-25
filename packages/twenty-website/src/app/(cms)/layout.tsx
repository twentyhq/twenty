import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twenty.com',
  description: 'Open Source CRM',
  icons: '/images/core/logo.svg',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
