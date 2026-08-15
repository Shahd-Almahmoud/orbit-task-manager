import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="stylesheet" href="https://cloudflare.com" /> */}
        <link rel="stylesheet" href="https://cloudflare.com" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  );
}
