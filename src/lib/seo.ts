import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Single source of truth for the site's identity, event facts and FAQ. This is
// reused by the visible FAQ section (AEO) AND the JSON-LD structured data
// (SEO/GEO), so the answer engines and the page always agree.
// ---------------------------------------------------------------------------

export const siteInfo = {
  name: 'Western College Garba & Dandiya Night',
  collegeName: 'Western College of Commerce & Business Management (Autonomous)',
  shortName: 'Western College',
  tagline: 'TRADITION • MUSIC • TOGETHERNESS',
  year: '2026',
  eventPeriod: 'Navratri Mahotsav 2026',
  summary:
    'Western College brings students together for Garba & Dandiya Night 2026: a free, student-only Navratri celebration with live Raas-Garba, Dhol and DJ beats, traditional attire, awards and complimentary Dandiya sticks.',
  organizer: 'Western College Student Council & Cultural Committee',
  phone: '+91 98200 12345',
  email: 'garba.cultural@westerncollege.edu.in',
  gatesOpen: '5:30 PM',
  startTime: '6:00 PM',
  endTime: '10:30 PM',
  // Set to an ISO date (e.g. "2026-10-08T18:00:00+05:30") once announced.
  eventStartDate: '',
  venue: {
    name: 'Western College Main Quadrangle',
    streetAddress: 'Plot No. 2, Sector 9, Main Institutional Zone, Opposite Central Garden, Autonomous Campus Quadrangle Ground',
    addressCountry: 'IN',
  },
  imagePath: '/og-image.jpg',
};

export interface SeoFaq {
  q: string;
  a: string;
}

/** Questions & answers shown on the site AND emitted as FAQPage schema. */
export const faqs: SeoFaq[] = [
  {
    q: 'What is the Western College Garba & Dandiya Night?',
    a: 'Garba & Dandiya Night is Western College\u2019s annual Navratri celebration. It features live Raas-Garba and 3-Taali rounds, Dhol-Tasha beats with a DJ Bollywood fusion, a Durga Aarti, traditional attire, awards and complimentary Dandiya sticks.',
  },
  {
    q: 'When is the Western College Garba & Dandiya Night 2026?',
    a: 'The event is part of the Navratri Mahotsav 2026. The exact date will be announced shortly on this portal and the college notice boards.',
  },
  {
    q: 'What time does the event start?',
    a: 'Gates open at 5:30 PM with security and E-Pass verification. Dandiya sticks distribution starts at 6:00 PM, the inaugural lamp lighting and Durga Aarti is at 6:30 PM, and the grand finale circle concludes around 10:30 PM.',
  },
  {
    q: 'How do I get an E-Pass for the Garba Night?',
    a: 'Create a free student account on this portal using your Student ID and college email. Each Student ID gets exactly one E-Pass, issued automatically. Log in anytime to view or download it.',
  },
  {
    q: 'Is the E-Pass free?',
    a: 'Yes. The E-Pass is 100% free of charge for currently enrolled students of Western College (Autonomous), organized by the Student Council and Cultural Committee with zero registration fee.',
  },
  {
    q: 'Who can attend the event?',
    a: 'Entry is strictly restricted to currently enrolled Western College students to ensure safety and capacity management. A physical student ID card plus the digital E-Pass QR code is required at the gates. Alumni and outsiders are not admitted.',
  },
  {
    q: 'Where is the event held?',
    a: 'The event is held at the Western College Campus Main Quadrangle Ground (Plot No. 2, Sector 9, Main Institutional Zone, Opposite Central Garden). Entry is via Gate 1 (BMS & Commerce) and Gate 2 (IT & PG).',
  },
  {
    q: 'What is the dress code?',
    a: 'Traditional attire is mandatory. Boys must wear Kurta Pyjama, Kedia or Dhoti; girls must wear Chaniya Choli, Ghagra or a traditional Kurti. Western casuals are not permitted.',
  },
  {
    q: 'Can I bring my own Dandiya sticks?',
    a: 'Yes, traditional blunt wooden Dandiya sticks are allowed. Complimentary pairs are also provided at the quadrangle pickup booth for registered pass holders. Metal or sharp acrylic sticks are prohibited.',
  },
  {
    q: 'What if I lose or forget my E-Pass?',
    a: 'Log in to your student account anytime and re-download your E-Pass. The event helpdesk near Gate 1 can also re-issue it after verifying your Student ID.',
  },
  {
    q: 'Can I have more than one E-Pass?',
    a: 'No. One Student ID = one account = one E-Pass, enforced at the database level. Sharing a pass is not allowed and only the first scan of a QR code is accepted at entry.',
  },
  {
    q: 'How do I reset my student account password?',
    a: 'On the Student Login page, choose \u201cForgot Password\u201d. Enter your Student ID and registered college email, verify the 6-digit code you receive, and set a new password. Your Student ID, Pass ID and barcode token stay unchanged.',
  },
];

// ---------------------------------------------------------------------------
// Runtime head manager: keeps canonical/OG/Twitter URLs absolute (they always
// match the host the visitor is on) and injects JSON-LD for SEO, AEO and GEO.
// ---------------------------------------------------------------------------

export type SeoRoute = 'home' | 'admin' | 'verify' | 'signup' | 'login' | 'forgot' | 'dashboard';

const baseTitle = 'Western College Garba & Dandiya Night 2026 | Free Student E-Pass';
const baseDescription = siteInfo.summary;

const pageMeta: Record<
  SeoRoute,
  { title: string; description: string; indexable: boolean; ogType: string }
> = {
  home: {
    title: baseTitle,
    description: baseDescription,
    indexable: true,
    ogType: 'website',
  },
  signup: {
    title: 'Create Student Account | Western College Garba E-Pass',
    description:
      'Sign up with your Western College Student ID and college email. One Student ID = one account = one free E-Pass for Garba & Dandiya Night 2026.',
    indexable: true,
    ogType: 'website',
  },
  login: {
    title: 'Student Login | Western College Garba E-Pass',
    description:
      'Log in to your student account to view and download your E-Pass for Western College Garba & Dandiya Night 2026.',
    indexable: true,
    ogType: 'website',
  },
  forgot: {
    title: 'Reset Password | Western College Garba E-Pass',
    description:
      'Reset your student account password with a secure one-time code sent to your registered college email.',
    indexable: true,
    ogType: 'website',
  },
  dashboard: {
    title: 'My E-Pass Dashboard | Western College Garba & Dandiya Night',
    description: 'View and download your E-Pass for Western College Garba & Dandiya Night 2026.',
    indexable: false,
    ogType: 'website',
  },
  admin: {
    title: 'Admin Console | Western College Garba E-Pass',
    description: 'Garba E-Pass administration.',
    indexable: false,
    ogType: 'website',
  },
  verify: {
    title: 'Verify E-Pass | Western College Garba & Dandiya Night',
    description: 'Verify a Garba Night E-Pass.',
    indexable: false,
    ogType: 'website',
  },
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, graph: unknown) {
  let el = document.getElementById(`seo-ld-${id}`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = `seo-ld-${id}`;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(graph);
}

function removeJsonLd(id: string) {
  document.getElementById(`seo-ld-${id}`)?.remove();
}

/** react hook — call once per navigation in App to keep the <head> correct. */
export function useSeo(route: SeoRoute) {
  useEffect(() => {
    const origin = window.location.origin;
    const meta = pageMeta[route];
    const image = `${origin}${siteInfo.imagePath}`;

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta(
      'name',
      'robots',
      meta.indexable
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    );

    // Absolute URLs so social/AI crawlers resolve them from any host.
    const canonicalUrl = meta.indexable && route !== 'verify' ? origin + window.location.pathname : origin + '/';
    upsertCanonical(canonicalUrl);

    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:type', meta.ogType);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', siteInfo.name);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:alt', 'Western College students dancing Raas Garba under festive canopy lights');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:image', image);

    // ---- Structured data (schema.org) ----
    if (!meta.indexable) {
      ['organization', 'website', 'event', 'faq'].forEach(removeJsonLd);
      return;
    }

    const organization = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': `${origin}/#organization`,
      name: siteInfo.collegeName,
      alternateName: siteInfo.shortName,
      url: `${origin}/`,
      description: siteInfo.summary,
      telephone: siteInfo.phone,
      email: siteInfo.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteInfo.venue.streetAddress,
        addressCountry: siteInfo.venue.addressCountry,
      },
    };
    upsertJsonLd('organization', organization);

    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: siteInfo.name,
      description: siteInfo.summary,
      inLanguage: 'en',
      publisher: { '@id': `${origin}/#organization` },
    };
    upsertJsonLd('website', website);

    if (route === 'home') {
      const event: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        '@id': `${origin}/#event`,
        name: siteInfo.name,
        description: siteInfo.summary,
        url: `${origin}/`,
        image: [image],
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        startTime: siteInfo.eventStartDate || undefined,
        duration: 'PT4H30M',
        location: {
          '@type': 'Place',
          name: siteInfo.venue.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: siteInfo.venue.streetAddress,
            addressCountry: siteInfo.venue.addressCountry,
          },
        },
        organizer: { '@type': 'Organization', name: siteInfo.organizer, '@id': `${origin}/#organization` },
        audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
        offers: {
          '@type': 'Offer',
          url: `${origin}/signup`,
          price: '0',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          description: 'Free digital E-Pass for currently enrolled Western College students (one per student).',
        },
      };
      upsertJsonLd('event', event);

      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${origin}/#faq`,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      };
      upsertJsonLd('faq', faqSchema);
    }
  }, [route]);
}