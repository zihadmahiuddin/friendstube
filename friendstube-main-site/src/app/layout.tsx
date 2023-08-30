import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Providers from "./providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FriendsTube",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-200 text-slate-950 dark:bg-slate-900 dark:text-slate-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
