// Komunal: public site chrome — smooth scroll, navbar, footer, WhatsApp float, Pixel and attribution.
import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"
import { MetaPixel } from "@/components/meta-pixel"
import { AttributionCapture } from "@/components/attribution-capture"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SmoothScroll>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </SmoothScroll>
      <WhatsAppFloat />
      <MetaPixel />
      <AttributionCapture />
    </>
  )
}
