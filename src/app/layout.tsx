import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "EssayForge AI | Local-First College Essay Coach",
  description: "AI-powered college admissions essay coach running 100% locally with LM Studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('essayforge_theme');
                  var theme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);

                  var savedAccent = localStorage.getItem('essayforge_accent');
                  if (savedAccent) {
                    document.documentElement.setAttribute('data-accent', savedAccent);
                  } else {
                    document.documentElement.setAttribute('data-accent', 'indigo');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-accent', 'indigo');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
