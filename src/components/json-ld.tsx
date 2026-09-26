// Komunal: renders structured data. A plain <script> (not next/script): it is data, not code.
import { jsonLd } from "@/lib/seo"

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  )
}
