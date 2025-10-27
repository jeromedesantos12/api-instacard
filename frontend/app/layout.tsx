import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import ToastProvider from "@/providers/ToastProvider";

export const metadata: Metadata = {
  title: "Instacard",
  description: "Manage your links easily",
};

const themeInit = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (dark) { root.classList.add('dark'); root.style.colorScheme = 'dark'; }
    else { root.classList.remove('dark'); root.style.colorScheme = 'light'; }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
      </head>
      <body>
        <ReduxProvider>
          <ToastProvider />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
