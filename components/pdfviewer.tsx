  'use client'
  import { PDFViewer, PDFViewerRef } from '@embedpdf/react-pdf-viewer'
  import { useRef, useEffect } from 'react'

  interface ViewerProps {
    url: string,
    themePreference?: 'light' | 'dark'
  }

  export default function PDFviewer({
    url,
    themePreference = 'light',
  }: ViewerProps) {
    const viewerRef = useRef<PDFViewerRef>(null)
    console.log(url);
    // Update theme when preference changes
    useEffect(() => {
      viewerRef.current?.container?.setTheme({ preference: themePreference })
    }, [themePreference])

    return (
      <div className="h-[600px] w-full overflow-hidden rounded-xl border border-gray-300 shadow-lg dark:border-gray-600">
        <PDFViewer
          ref={viewerRef}
          config={{
            src: url,
            theme: { preference: themePreference },
            disabledCategories: ['annotation', 'print', 'document-export', 'document-print', 'redaction']
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    )
  }