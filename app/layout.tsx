import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Space_Grotesk } from "next/font/google";
import { QueryProviders } from "@/components/query-provider";
import { cn } from "@/lib/utils";
import { JotaiProvider } from "@/components/jotai-provider";
import { ModalProvider } from "@/components/modal-provider";

const sg = Space_Grotesk({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
      </head>
      <body className={cn(sg.className, "antialiased min-h-screen")}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <QueryProviders>
            <JotaiProvider>
              <ModalProvider />
              {children}
              <Toaster richColors />
            </JotaiProvider>
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
