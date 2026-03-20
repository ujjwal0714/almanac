import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'dtbom.space — Notes',
  description: 'Personal notes and writing by Ujjwal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Typora export CSS — sourced from /public */}
        <link rel="stylesheet" href="/base.css" />
        <link rel="stylesheet" href="/base-control.css" />
        <link rel="stylesheet" href="/print.css" />
        {/* <link rel="stylesheet" href="/fluent.css" /> */}

        {/* Prevent flash of wrong theme on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',s||(d?'dark':'light'));}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
