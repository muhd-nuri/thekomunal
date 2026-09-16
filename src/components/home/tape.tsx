// Komunal: tape marquee — a white poster strip taped across the blue band, brand shouts on repeat.
import { TapeMarquee } from "@/components/brand/tape-marquee"
import { tapePhrases } from "@/data/site"

export function Tape() {
  return (
    // `relative` is required: the [data-band="brand"] grain layer is absolutely positioned.
    <div data-band="brand" className="relative bg-brand py-2">
      <TapeMarquee phrases={tapePhrases} />
    </div>
  )
}
