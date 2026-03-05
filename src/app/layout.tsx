import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const basePath = process.env.NODE_ENV === 'production' ? '/price' : '';

export const metadata: Metadata = {
  title: "Прайс-лист на монтаж",
  description: "Удобный справочник цен на монтажные работы. Быстрый поиск услуг и расчёт стоимости.",
  keywords: ["прайс-лист", "монтаж", "сантехника", "отопление", "водоснабжение", "цены", "услуги"],
  authors: [{ name: "Прайс-лист" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Прайс-лист",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: `${basePath}/manifest.json`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#667eea" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
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
        <meta name="apple-mobile-web-app-title" content="Прайс-лист" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="icon" href={`${basePath}/favicon.ico`} sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href={`${basePath}/icons/favicon-16x16.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/icons/favicon-32x32.png`} />

        <link rel="apple-touch-icon" href={`${basePath}/icons/apple-touch-icon.png`} />
        <link rel="apple-touch-icon" sizes="152x152" href={`${basePath}/icons/ios/152x152.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/icons/apple-touch-icon.png`} />
        <link rel="apple-touch-icon" sizes="167x167" href={`${basePath}/icons/ios/167x167.png`} />

        <link rel="icon" type="image/png" sizes="192x192" href={`${basePath}/icons/android/android-192x192.png`} />
        <link rel="icon" type="image/png" sizes="512x512" href={`${basePath}/icons/android/android-512x512.png`} />

        <meta name="msapplication-config" content={`${basePath}/browserconfig.xml`} />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var swPath = '${basePath}/sw.js';
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register(swPath).then(
                      function(registration) {
                        console.log('SW registered:', registration.scope);
                      },
                      function(err) {
                        console.log('SW registration failed:', err);
                      }
                    );
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
