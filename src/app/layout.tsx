import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonnar";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devlinks",
  description: "A place where you can share your social links with the world",
  icons: {
    icon: "/assets/images/logo-devlinks-small.svg",
  },
};

type Props = Readonly<{ children: React.ReactNode }>;

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={`${instrumentSans.variable} flex min-h-svh flex-col font-sans antialiased`}>
        {children}
        <Toaster
          toastOptions={{
            className: "!px-6 !w-fit !border-none",
            classNames: {
              title: "!font-semibold",
              icon: "!mr-2",
            },
          }}
        />
      </body>
    </html>
  );
}
