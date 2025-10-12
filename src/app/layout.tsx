import { type Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
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
  title: "EnergyFlow - Optimize Your Physical & Cognitive Energy",
  description: "Track your daily inputs, discover personal patterns, and receive joyful insights to help you optimize your physical and cognitive energy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} font-body antialiased min-h-screen bg-background text-foreground`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
