import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "NEIF Saylani",
  description: "Created with v0",
  generator: "v0.dev",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-arp="">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
