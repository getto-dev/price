import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const basePath = process.env.NODE_ENV === 'production' ? '/price' : '';

export const metadata: Metadata = {
  title: 'Прайс-лист на монтаж',
  description: 'Удобный справочник цен на монтажные работы',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Прайс-лист',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1b4b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Прайс-лист" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${basePath}/icons/ios/180.png`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var basePath = '${basePath}' || '';
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register(basePath + '/sw.js', { scope: basePath + '/' });
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
