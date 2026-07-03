import type { Metadata } from "next";
import { AccessReset } from "@/components/access-reset";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EIKON | Album digitale",
    template: "%s | EIKON"
  },
  description: "Un archivio privato di ricordi in forma di desktop minimale.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  openGraph: {
    title: "EIKON | Album digitale",
    description: "Ricordi, viaggi e anni raccolti in un desktop minimale privato.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <AccessReset />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
