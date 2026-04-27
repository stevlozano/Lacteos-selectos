import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MaterialSymbols } from "@/components/MaterialSymbols";
import { PageLoader } from "@/components/PageLoader";
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { OrdersProvider } from '@/context/OrdersContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { PWAInstaller } from '@/components/PWAInstaller';
import { UpdateNotification } from '@/components/UpdateNotification';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lácteos Selectos - Pedidos Online",
  description: "Yogurts, quesos, mantequilla y manjar artesanales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased `}
    >
      <head>
        <MaterialSymbols />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lácteos Selectos" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-900 transition-colors">
        <PageLoader>
          <ThemeProvider>
            <AuthProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <NotificationsProvider>
                    <CartProvider>
                      {children}
                      <PWAInstaller />
                      <UpdateNotification />
                    </CartProvider>
                  </NotificationsProvider>
                </OrdersProvider>
              </ProductsProvider>
            </AuthProvider>
          </ThemeProvider>
        </PageLoader>
      </body>
    </html>
  );
}
