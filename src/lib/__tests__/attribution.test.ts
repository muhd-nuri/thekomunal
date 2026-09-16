import { describe, expect, test } from "bun:test"

import {
  decodeTouch,
  deriveChannel,
  encodeTouch,
  hasSignal,
  sanitiseRef,
  touchFromLocation,
  type SourceChannel,
  type Touch,
} from "@/lib/attribution"

const base = (extra: Partial<Touch>): Touch => ({
  landing: "/",
  ts: 1,
  ...extra,
})

describe("sanitiseRef", () => {
  test("lowercases and strips", () => {
    expect(sanitiseRef("Aina-IG")).toBe("aina-ig")
    expect(sanitiseRef("new agency!<script>")).toBe("newagencyscript")
    expect(sanitiseRef("x".repeat(60))).toHaveLength(40)
  })
  test("empty becomes undefined", () => {
    expect(sanitiseRef("!!!")).toBeUndefined()
    expect(sanitiseRef(null)).toBeUndefined()
  })
})

describe("touchFromLocation", () => {
  test("reads params and ignores internal referrers", () => {
    const t = touchFromLocation({
      url: "https://thekomunal.com/?ref=Test-Agency&utm_source=instagram",
      referrer: "https://www.thekomunal.com/menu",
      ownHost: "thekomunal.com",
      now: 5,
    })
    expect(t).toEqual({
      landing: "/?ref=Test-Agency&utm_source=instagram",
      ts: 5,
      ref: "test-agency",
      utm_source: "instagram",
    })
    expect(hasSignal(t)).toBe(true)
  })

  test("keeps external referrers", () => {
    const t = touchFromLocation({
      url: "https://thekomunal.com/reserve",
      referrer: "https://l.instagram.com/",
      ownHost: "thekomunal.com",
      now: 5,
    })
    expect(t.referrer).toBe("https://l.instagram.com/")
  })

  test("a plain visit has no signal", () => {
    const t = touchFromLocation({
      url: "https://thekomunal.com/",
      referrer: "",
      ownHost: "thekomunal.com",
      now: 5,
    })
    expect(hasSignal(t)).toBe(false)
  })
})

describe("cookie round trip", () => {
  test("encode then decode", () => {
    const t = base({
      ref: "aina-ig",
      utm_campaign: "raya 2026",
      referrer: "https://google.com/",
    })
    expect(decodeTouch(encodeTouch(t))).toEqual(t)
  })
  test("garbage is ignored", () => {
    expect(decodeTouch("not-json")).toBeNull()
    expect(decodeTouch(undefined)).toBeNull()
    expect(
      decodeTouch(
        encodeURIComponent(JSON.stringify({ ref: "BAD REF!", landing: 3 }))
      )
    ).toEqual({
      landing: "",
      ts: 0,
      ref: "badref",
    })
  })
})

describe("deriveChannel", () => {
  test.each<[Partial<Touch>, SourceChannel, string | undefined]>([
    [
      { ref: "test-agency", utm_source: "instagram" },
      "referral",
      "test-agency",
    ],
    [{ utm_source: "facebook", utm_medium: "cpc" }, "paid_social", "facebook"],
    [{ utm_source: "google", utm_medium: "cpc" }, "paid_search", "google"],
    [
      { utm_source: "newsletter", utm_medium: "paid_social" },
      "paid_social",
      "newsletter",
    ],
    [{ fbclid: "abc" }, "social", "facebook"],
    [
      { fbclid: "abc", utm_source: "fb", utm_medium: "paid" },
      "paid_social",
      "fb",
    ],
    [{ gclid: "abc" }, "paid_search", "google"],
    [{ ttclid: "abc" }, "paid_social", "tiktok"],
    [{ utm_source: "poster" }, "campaign", "poster"],
    [{ referrer: "https://www.google.com.my/" }, "organic_search", "google"],
    [{ referrer: "https://maps.google.com/" }, "google_maps", "google"],
    [{ referrer: "https://maps.app.goo.gl/abc" }, "google_maps", "google"],
    [{ referrer: "https://www.bing.com/" }, "organic_search", "bing"],
    [{ referrer: "https://l.instagram.com/" }, "social", "instagram"],
    [{ referrer: "https://lm.facebook.com/" }, "social", "facebook"],
    [{ referrer: "https://t.co/xyz" }, "social", "x"],
    [{ referrer: "https://wa.me/" }, "whatsapp", "whatsapp"],
    [
      { referrer: "https://blog.example.com/post" },
      "website",
      "blog.example.com",
    ],
    [{}, "direct", undefined],
  ])("%j → %s", (extra, channel, detail) => {
    expect(deriveChannel(base(extra))).toEqual(
      detail === undefined ? { channel } : { channel, detail }
    )
  })

  test("no cookie is direct", () => {
    expect(deriveChannel(null)).toEqual({ channel: "direct" })
  })
})
