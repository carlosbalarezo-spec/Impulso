import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IMPULSO — Mesa Editorial Inteligente y Supervisada",
  description: "Dashboard interno de curación de contenido, análisis psicológico deportivo y gobernanza de guiones para video vertical 9:16.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
