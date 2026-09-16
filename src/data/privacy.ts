// Komunal: PDPA privacy notice — plain words, warm but exact; every line describes what the site really does.
// Personal Data Protection Act 2010 (as amended in 2024). Section 7(3) asks for the notice in both
// Bahasa Melayu and English, so the two versions below must stay in step.
import { site } from "@/data/site"
import { primaryOutlet } from "@/data/outlets"
import { FIRST_TOUCH_DAYS, LAST_TOUCH_DAYS } from "@/lib/attribution"

export type CookieRow = {
  name: string
  setBy: string
  purpose: string
  duration: string
}

export type PrivacyBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "contact"; items: { label: string; value: string; href: string }[] }
  | {
      kind: "cookies"
      columns: {
        name: string
        setBy: string
        purpose: string
        duration: string
      }
      rows: CookieRow[]
    }

export type PrivacySection = {
  /** Anchor id for the H2. Bahasa Melayu ids carry an `ms-` prefix so they never clash. */
  id: string
  heading: string
  blocks: PrivacyBlock[]
}

export type PrivacyNotice = {
  lang: "en" | "ms"
  eyebrow: string
  title: string
  intro: string
  effectiveLabel: string
  tocHeading: string
  sections: PrivacySection[]
}

export const privacyMeta = {
  effectiveDate: "16 September 2026",
  effectiveDateMs: "16 September 2026",
  lastReviewed:
    "Last reviewed on 16 September 2026, when online booking was added to this website.",
  lastReviewedMs:
    "Kali terakhir disemak pada 16 September 2026, apabila tempahan dalam talian ditambah pada laman web ini.",
  metaTitle: "Privacy notice",
  metaDescription:
    "How The Komunal collects, uses and protects the personal data you share with us when you visit our website or book a table.",
  jumpToMs: { label: "Baca dalam Bahasa Melayu", href: "#bahasa-melayu" },
  jumpToEn: { label: "Read in English", href: "#english" },
  msAnchor: "bahasa-melayu",
  enAnchor: "english",
} as const

// TODO: add a privacy contact email (there is no public email yet, so none is listed).
const contactItems = [
  { label: "Phone", value: site.phone.display, href: site.phone.href },
  {
    label: "WhatsApp",
    value: waDisplay(site.whatsappNumber),
    href: `https://wa.me/${site.whatsappNumber}`,
  },
]

const contactItemsMs = [
  { ...contactItems[0], label: "Telefon" },
  { ...contactItems[1], label: "WhatsApp" },
]

/** "60164375378" → "016-437 5378" for display. */
function waDisplay(number: string) {
  const local = number.startsWith("60") ? `0${number.slice(2)}` : number
  if (local.length === 10)
    return `${local.slice(0, 3)}-${local.slice(3, 6)} ${local.slice(6)}`
  if (local.length === 11)
    return `${local.slice(0, 3)}-${local.slice(3, 7)} ${local.slice(7)}`
  return local
}

// TODO: confirm retention with the client (draft: up to 24 months after the booking date).
const RETENTION_EN =
  "We keep booking details for up to 24 months after your booking date, unless we need them longer for legal or accounting reasons. After that, we delete them or make them anonymous."
const RETENTION_MS =
  "Kami menyimpan butiran tempahan sehingga 24 bulan selepas tarikh tempahan anda, melainkan kami perlu menyimpannya lebih lama atas sebab undang-undang atau perakaunan. Selepas itu, kami memadam butiran tersebut atau menjadikannya tanpa nama."

export const privacyEn: PrivacyNotice = {
  lang: "en",
  eyebrow: "Privacy",
  title: "Privacy notice",
  intro:
    "This notice explains what personal data we collect when you use our website or book a table, why we collect it, and what you can do about it. We have kept it short and plain.",
  effectiveLabel: "Effective from",
  tocHeading: "On this page",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      blocks: [
        {
          kind: "p",
          text: `This website is run by ${site.entity}, which operates ${site.name} café. Under the Personal Data Protection Act 2010, we are the \u201cdata user\u201d responsible for your personal data.`,
        },
        {
          kind: "p",
          text: `Our café is at ${primaryOutlet.address}. You can reach us here:`,
        },
        { kind: "contact", items: contactItems },
      ],
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      blocks: [
        {
          kind: "p",
          text: "When you send a booking request, we collect:",
        },
        {
          kind: "list",
          items: [
            "Your name, email address and mobile number.",
            "Your company name, if you give it.",
            "What the booking is for (for example, a birthday or a business meeting), the outlet, the number of guests, and the date and time.",
            "Any notes you add.",
            "A booking code and the status of your booking (for example, new, confirmed or cancelled).",
          ],
        },
        {
          kind: "p",
          text: "When you visit our website, we also note how you found us. Two small cookies remember the first and the latest way you arrived. When you book, we save that with your booking:",
        },
        {
          kind: "list",
          items: [
            "A partner referral code, if you came through a partner's link.",
            "Campaign tags in the link you clicked (known as UTM parameters).",
            "Ad click IDs added by Facebook, Google or TikTok when you click one of our ads.",
            "The website that sent you here, if it was another site.",
            "The page you first landed on, and the page you booked from.",
          ],
        },
        {
          kind: "p",
          text: "We also collect some technical data:",
        },
        {
          kind: "list",
          items: [
            "Your browser's user agent, which describes your browser and device type.",
            "A scrambled version of your IP address (a salted hash). We never store your actual IP address. We use the hash only to stop spam and repeated automated requests.",
          ],
        },
        {
          kind: "p",
          text: "Our website uses the Meta (Facebook) Pixel. It tells Meta when a page on our site is viewed, and when a booking request is sent.",
        },
        {
          kind: "p",
          text: "Our Visit page shows a Google Maps map. When you open that page, your browser loads the map from Google, which receives your IP address and may set its own cookies.",
        },
      ],
    },
    {
      id: "why-we-use-it",
      heading: "Why we use it",
      blocks: [
        {
          kind: "list",
          items: [
            "To handle your booking request, confirm it and contact you about it.",
            "To plan your visit or event, such as setting up for your group.",
            "To understand which channels bring us bookings, including links shared by our partners.",
            "To prevent spam and abuse of our booking form.",
            "To measure and improve our advertising, through the Meta Pixel.",
          ],
        },
      ],
    },
    {
      id: "is-it-required",
      heading: "Do you have to give it?",
      blocks: [
        {
          kind: "p",
          text: "To process a booking, we need your name, mobile number, email address, what the booking is for, the date and time, and the number of guests. Your company name and notes are optional.",
        },
        {
          kind: "p",
          text: "If you do not give the required details, we cannot take your booking online. You can still WhatsApp or call us instead.",
        },
      ],
    },
    {
      id: "who-we-share-it-with",
      heading: "Who we share it with",
      blocks: [
        {
          kind: "p",
          text: "We share your data only where we need to:",
        },
        {
          kind: "list",
          items: [
            "Our staff, who handle bookings.",
            "Telegram, which we use to send new booking details to our team's internal group.",
            "WhatsApp, which we use to contact you about your booking.",
            "Meta, which receives data from the Meta Pixel.",
            "Google, which receives your IP address when the map on our Visit page loads.",
            "The provider that hosts our server.",
            "Government authorities, courts or regulators, where the law requires it.",
          ],
        },
        {
          kind: "p",
          text: "We do not sell your personal data.",
        },
      ],
    },
    {
      id: "outside-malaysia",
      heading: "Transfers outside Malaysia",
      blocks: [
        {
          kind: "p",
          text: "Telegram, WhatsApp and Meta may store or process data on servers outside Malaysia. When we use these services, your data may leave Malaysia and is handled under their own terms and privacy policies.",
        },
      ],
    },
    {
      id: "how-long-we-keep-it",
      heading: "How long we keep it",
      blocks: [{ kind: "p", text: RETENTION_EN }],
    },
    {
      id: "security",
      heading: "How we protect it",
      blocks: [
        {
          kind: "list",
          items: [
            "Your booking data is stored in our own database on our own server. Access is limited to people who need it.",
            "We store IP addresses only as salted hashes, never in their original form.",
            "If a data breach happens, we will notify the Personal Data Protection Commissioner and the people affected, where the law requires it.",
          ],
        },
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        {
          kind: "p",
          text: "You can ask us to:",
        },
        {
          kind: "list",
          items: [
            "Give you access to the personal data we hold about you.",
            "Correct data that is wrong, incomplete or out of date.",
            "Stop or limit how we use your data, or withdraw your consent.",
            "Send your data to you or to another organisation (data portability), where this right applies.",
          ],
        },
        {
          kind: "p",
          text: "To make a request, contact us by phone or WhatsApp using the details in “Who we are”. We may ask you to confirm who you are before we act on it. If you withdraw consent, we may no longer be able to handle your booking.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      blocks: [
        {
          kind: "p",
          text: "Cookies are small files saved in your browser. We use these:",
        },
        {
          kind: "cookies",
          columns: {
            name: "Cookie",
            setBy: "Set by",
            purpose: "Purpose",
            duration: "Lasts",
          },
          rows: [
            {
              name: "km_ft",
              setBy: site.name,
              purpose: "Remembers how you first found our website.",
              duration: `${FIRST_TOUCH_DAYS} days`,
            },
            {
              name: "km_lt",
              setBy: site.name,
              purpose: "Remembers the latest way you arrived on our website.",
              duration: `${LAST_TOUCH_DAYS} days`,
            },
            {
              name: "Meta Pixel cookies",
              setBy: "Meta",
              purpose:
                "Help Meta measure visits and booking requests from our ads.",
              duration: "Set by Meta",
            },
            {
              name: "Google Maps cookies",
              setBy: "Google",
              purpose: "Set by the map on our Visit page, if you open it.",
              duration: "Set by Google",
            },
          ],
        },
        {
          kind: "p",
          text: "You can clear or block cookies in your browser settings. If you do, the website still works, and you can still book a table.",
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this notice",
      blocks: [
        {
          kind: "p",
          text: "We may update this notice when our website or the law changes. We will post the new version on this page and update the effective date.",
        },
        {
          kind: "p",
          text: `This notice is effective from ${privacyMeta.effectiveDate}.`,
        },
      ],
    },
  ],
}

// TODO: have the BM translation reviewed by the client / a legal reviewer before launch.
export const privacyMs: PrivacyNotice = {
  lang: "ms",
  eyebrow: "Privasi",
  title: "Notis privasi",
  intro:
    "Notis ini menerangkan data peribadi yang kami kumpul apabila anda menggunakan laman web kami atau menempah meja, sebab kami mengumpulnya, dan apa yang boleh anda lakukan mengenainya. Kami menulisnya dengan ringkas dan mudah.",
  effectiveLabel: "Berkuat kuasa mulai",
  tocHeading: "Kandungan",
  sections: [
    {
      id: "ms-siapa-kami",
      heading: "Siapa kami",
      blocks: [
        {
          kind: "p",
          text: `Laman web ini dikendalikan oleh ${site.entity}, yang mengendalikan kafe ${site.name}. Di bawah Akta Perlindungan Data Peribadi 2010, kami ialah “pengguna data” yang bertanggungjawab ke atas data peribadi anda.`,
        },
        {
          kind: "p",
          text: `Kafe kami terletak di ${primaryOutlet.address}. Anda boleh menghubungi kami di sini:`,
        },
        { kind: "contact", items: contactItemsMs },
      ],
    },
    {
      id: "ms-data-dikumpul",
      heading: "Data yang kami kumpul",
      blocks: [
        {
          kind: "p",
          text: "Apabila anda menghantar permintaan tempahan, kami mengumpul:",
        },
        {
          kind: "list",
          items: [
            "Nama, alamat e-mel dan nombor telefon bimbit anda.",
            "Nama syarikat anda, jika diberikan.",
            "Tujuan tempahan (contohnya, majlis hari jadi atau mesyuarat perniagaan), cawangan, bilangan tetamu, serta tarikh dan masa.",
            "Sebarang catatan yang anda tambah.",
            "Kod tempahan dan status tempahan anda (contohnya, baharu, disahkan atau dibatalkan).",
          ],
        },
        {
          kind: "p",
          text: "Apabila anda melawat laman web kami, kami juga merekod cara anda menemui kami. Dua kuki kecil mengingati cara pertama dan cara terkini anda tiba. Apabila anda menempah, maklumat ini disimpan bersama tempahan anda:",
        },
        {
          kind: "list",
          items: [
            "Kod rujukan rakan kongsi, jika anda datang melalui pautan rakan kongsi kami.",
            "Tag kempen dalam pautan yang anda klik (dikenali sebagai parameter UTM).",
            "ID klik iklan yang ditambah oleh Facebook, Google atau TikTok apabila anda mengklik iklan kami.",
            "Laman web yang menghantar anda ke sini, jika ia laman web lain.",
            "Halaman pertama yang anda buka, dan halaman tempat anda membuat tempahan.",
          ],
        },
        {
          kind: "p",
          text: "Kami juga mengumpul sedikit data teknikal:",
        },
        {
          kind: "list",
          items: [
            "Ejen pengguna (user agent) pelayar anda, yang menerangkan jenis pelayar dan peranti anda.",
            "Versi alamat IP anda yang telah dikodkan (cincangan bergaram). Kami tidak sekali-kali menyimpan alamat IP sebenar anda. Kami menggunakan cincangan ini hanya untuk menghalang spam dan permintaan automatik berulang.",
          ],
        },
        {
          kind: "p",
          text: "Laman web kami menggunakan Meta (Facebook) Pixel. Ia memberitahu Meta apabila halaman di laman web kami dilihat, dan apabila permintaan tempahan dihantar.",
        },
        {
          kind: "p",
          text: "Halaman Lawatan kami memaparkan peta Google Maps. Apabila anda membuka halaman itu, pelayar anda memuatkan peta daripada Google, yang menerima alamat IP anda dan mungkin menetapkan kukinya sendiri.",
        },
      ],
    },
    {
      id: "ms-tujuan",
      heading: "Tujuan kami menggunakannya",
      blocks: [
        {
          kind: "list",
          items: [
            "Untuk menguruskan permintaan tempahan anda, mengesahkannya dan menghubungi anda mengenainya.",
            "Untuk merancang lawatan atau majlis anda, seperti membuat persiapan untuk kumpulan anda.",
            "Untuk memahami saluran yang membawa tempahan kepada kami, termasuk pautan yang dikongsi oleh rakan kongsi kami.",
            "Untuk menghalang spam dan penyalahgunaan borang tempahan kami.",
            "Untuk mengukur dan menambah baik pengiklanan kami, melalui Meta Pixel.",
          ],
        },
      ],
    },
    {
      id: "ms-wajib",
      heading: "Adakah anda wajib memberikannya?",
      blocks: [
        {
          kind: "p",
          text: "Untuk memproses tempahan, kami memerlukan nama, nombor telefon bimbit, alamat e-mel, tujuan tempahan, tarikh dan masa, serta bilangan tetamu. Nama syarikat dan catatan adalah pilihan.",
        },
        {
          kind: "p",
          text: "Jika anda tidak memberikan butiran yang diperlukan, kami tidak dapat menerima tempahan anda secara dalam talian. Anda masih boleh menghubungi kami melalui WhatsApp atau telefon.",
        },
      ],
    },
    {
      id: "ms-pendedahan",
      heading: "Kepada siapa kami mendedahkannya",
      blocks: [
        {
          kind: "p",
          text: "Kami hanya berkongsi data anda apabila perlu:",
        },
        {
          kind: "list",
          items: [
            "Kakitangan kami yang menguruskan tempahan.",
            "Telegram, yang kami gunakan untuk menghantar butiran tempahan baharu ke kumpulan dalaman pasukan kami.",
            "WhatsApp, yang kami gunakan untuk menghubungi anda mengenai tempahan anda.",
            "Meta, yang menerima data daripada Meta Pixel.",
            "Google, yang menerima alamat IP anda apabila peta di halaman Lawatan kami dimuatkan.",
            "Penyedia yang mengehos pelayan kami.",
            "Pihak berkuasa kerajaan, mahkamah atau pengawal selia, apabila dikehendaki oleh undang-undang.",
          ],
        },
        {
          kind: "p",
          text: "Kami tidak menjual data peribadi anda.",
        },
      ],
    },
    {
      id: "ms-luar-malaysia",
      heading: "Pemindahan ke luar Malaysia",
      blocks: [
        {
          kind: "p",
          text: "Telegram, WhatsApp dan Meta mungkin menyimpan atau memproses data di pelayan di luar Malaysia. Apabila kami menggunakan perkhidmatan ini, data anda mungkin dipindahkan ke luar Malaysia dan dikendalikan di bawah terma dan dasar privasi mereka sendiri.",
        },
      ],
    },
    {
      id: "ms-tempoh-simpanan",
      heading: "Tempoh simpanan",
      blocks: [{ kind: "p", text: RETENTION_MS }],
    },
    {
      id: "ms-keselamatan",
      heading: "Cara kami melindunginya",
      blocks: [
        {
          kind: "list",
          items: [
            "Data tempahan anda disimpan dalam pangkalan data kami sendiri di pelayan kami sendiri. Akses dihadkan kepada mereka yang memerlukannya sahaja.",
            "Kami menyimpan alamat IP hanya sebagai cincangan bergaram, tidak sekali-kali dalam bentuk asal.",
            "Jika berlaku pelanggaran data, kami akan memaklumkan Pesuruhjaya Perlindungan Data Peribadi dan individu yang terjejas, apabila dikehendaki oleh undang-undang.",
          ],
        },
      ],
    },
    {
      id: "ms-hak-anda",
      heading: "Hak anda",
      blocks: [
        {
          kind: "p",
          text: "Anda boleh meminta kami untuk:",
        },
        {
          kind: "list",
          items: [
            "Memberikan akses kepada data peribadi anda yang kami simpan.",
            "Membetulkan data yang salah, tidak lengkap atau tidak terkini.",
            "Menghentikan atau mengehadkan penggunaan data anda, atau menarik balik kebenaran anda.",
            "Menghantar data anda kepada anda atau kepada organisasi lain (kebolehalihan data), jika hak ini terpakai.",
          ],
        },
        {
          kind: "p",
          text: "Untuk membuat permintaan, hubungi kami melalui telefon atau WhatsApp menggunakan butiran di bahagian “Siapa kami”. Kami mungkin meminta anda mengesahkan identiti anda sebelum kami bertindak. Jika anda menarik balik kebenaran, kami mungkin tidak lagi dapat menguruskan tempahan anda.",
        },
      ],
    },
    {
      id: "ms-kuki",
      heading: "Kuki",
      blocks: [
        {
          kind: "p",
          text: "Kuki ialah fail kecil yang disimpan dalam pelayar anda. Kami menggunakan kuki berikut:",
        },
        {
          kind: "cookies",
          columns: {
            name: "Kuki",
            setBy: "Ditetapkan oleh",
            purpose: "Tujuan",
            duration: "Tempoh",
          },
          rows: [
            {
              name: "km_ft",
              setBy: site.name,
              purpose: "Mengingati cara anda mula-mula menemui laman web kami.",
              duration: `${FIRST_TOUCH_DAYS} hari`,
            },
            {
              name: "km_lt",
              setBy: site.name,
              purpose: "Mengingati cara terkini anda tiba di laman web kami.",
              duration: `${LAST_TOUCH_DAYS} hari`,
            },
            {
              name: "Kuki Meta Pixel",
              setBy: "Meta",
              purpose:
                "Membantu Meta mengukur lawatan dan permintaan tempahan daripada iklan kami.",
              duration: "Ditetapkan oleh Meta",
            },
            {
              name: "Kuki Google Maps",
              setBy: "Google",
              purpose:
                "Ditetapkan oleh peta di halaman Lawatan kami, jika anda membukanya.",
              duration: "Ditetapkan oleh Google",
            },
          ],
        },
        {
          kind: "p",
          text: "Anda boleh memadam atau menyekat kuki melalui tetapan pelayar anda. Jika anda berbuat demikian, laman web ini masih berfungsi dan anda masih boleh menempah meja.",
        },
      ],
    },
    {
      id: "ms-perubahan",
      heading: "Perubahan pada notis ini",
      blocks: [
        {
          kind: "p",
          text: "Kami mungkin mengemas kini notis ini apabila laman web kami atau undang-undang berubah. Kami akan menyiarkan versi baharu di halaman ini dan mengemas kini tarikh berkuat kuasa.",
        },
        {
          kind: "p",
          text: `Notis ini berkuat kuasa mulai ${privacyMeta.effectiveDateMs}.`,
        },
      ],
    },
  ],
}
