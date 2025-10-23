import { type Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});


export const metadata: Metadata = {
  title: "Ryze - Optimize Your Physical & Cognitive Energy",
  description: "Track your daily inputs, discover personal patterns, and receive joyful insights to help you optimize your physical and cognitive energy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} ${inter.variable} font-body antialiased min-h-screen bg-background text-foreground`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
