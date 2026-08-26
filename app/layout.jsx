import "@/assets/styles/globals.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="stylesheet" href="https://cloudflare.com" /> */}
        <link rel="stylesheet" href="https://cloudflare.com" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AuthProvider>
          <main>{children}</main>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
