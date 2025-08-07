import '../styles/globals.css'

export const metadata = {
  title: 'BardFlasher',
  description: 'Active Locked PI Withdrawal Bot',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        {children}
      </body>
    </html>
  )
}
