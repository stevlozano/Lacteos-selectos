import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MaterialSymbols } from "@/components/MaterialSymbols";
import { PageLoader } from "@/components/PageLoader";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { OrdersProvider } from "@/context/OrdersContext";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <MaterialSymbols />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-900 transition-colors">
        <PageLoader>
          <ThemeProvider>
            <AuthProvider>
              <ProductsProvider>
                <OrdersProvider>
                  <CartProvider>
                    {children}
                  </CartProvider>
                </OrdersProvider>
              </ProductsProvider>
            </AuthProvider>
          </ThemeProvider>
        </PageLoader>
      </body>
    </html>
  );
}
