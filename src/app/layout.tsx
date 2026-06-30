import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import LocationPromptModal from "@/components/LocationPromptModal";
import CivicBot from "@/components/CivicBot";
import GamificationAlerts from "@/components/GamificationAlerts";
import { LocationProvider } from "@/context/LocationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";

export const metadata: Metadata = {
  title: "CiviLog — Live Community Issue Tracker",
  description: "Report potholes, garbage pileups, broken streetlights and water leaks. Powered by interactive local maps and AI issue categorization.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('civilog-theme');
                  if (saved === 'light' || saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', saved);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <GamificationProvider>
              <LocationProvider>
                <LocationPromptModal />
                <main style={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
                  {children}
                </main>
                <BottomNav />
                <CivicBot />
                <GamificationAlerts />
              </LocationProvider>
            </GamificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
