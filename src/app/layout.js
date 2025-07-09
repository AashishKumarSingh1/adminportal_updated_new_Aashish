import { AuthProvider } from './components/AuthProvider'
import './globals.css'

export const metadata = {
  title: 'Admin Panel | NIT Patna',
  description: 'Admin Panel | NIT Patna',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
