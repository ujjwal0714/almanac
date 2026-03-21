// app/test/page.tsx
import PDFviewer from "./pdfviewer"

export default function Page() {
  return (
    <div className="p-4">
      <PDFviewer url="/api/pdf?file=OS/ch1_new.pdf"></PDFviewer>
    </div>
  )
}