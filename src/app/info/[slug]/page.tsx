import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import styles from '../../../styles/info.module.css';

interface InfoPageProps {
  params: Promise<{ slug: string }>;
}

const CONTENT_MAP: Record<string, { title: string; subtitle: string; content: string[] }> = {
  about: {
    title: "About CivicPulse",
    subtitle: "Connecting citizens with community maintenance",
    content: [
      "CivicPulse is a community-led digital mapping workspace designed to empower citizens to directly influence their urban environment.",
      "By utilizing client-side Geolocation details and simulated vision diagnostics, our system aims to reduce repair turnaround times by streamlining report categorization and incident coordinate pinning.",
      "We believe that small individual reports lead to large-scale civic improvements. Welcome to the pulse of your neighborhood."
    ]
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "How we protect and manage your geographic details",
    content: [
      "CivicPulse values your privacy. Geolocation coordinates are gathered dynamically on-device and processed locally via standard web geolocation APIs.",
      "We store reported issues, coordinates, and upvotes inside your local browser memory space (localStorage) to ensure zero third-party tracking.",
      "Images and media uploads are maintained locally and processed via client-side scripts to avoid server profiling."
    ]
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Rules of conduct for civic reports",
    content: [
      "By utilizing CivicPulse, citizens agree to report real and accurate visual evidence of community damage.",
      "Citizens must refrain from uploading images containing personal identifier details (faces, license plates) or spam content.",
      "We reserve the right to prune duplicate markers placed on the same geographic coordinates."
    ]
  },
  guidelines: {
    title: "Community Guidelines",
    subtitle: "Reporting incidents responsibly",
    content: [
      "Be constructive: report issues that require physical maintenance, safety interventions, or municipal crew assistance.",
      "Do not duplicate: inspect the Map View before reporting to ensure your neighbors haven't already reported the same pothole or bin.",
      "Be respectful: treat other community members and public workers with courtesy in your description inputs."
    ]
  },
  safety: {
    title: "Safety First",
    subtitle: "Protecting yourself while documenting hazards",
    content: [
      "Do not compromise your personal safety to take photos or videos of potholes, garbage bins, or broken lamps.",
      "Always remain on sidewalks and pedestrian pathways. Do not walk into active vehicle paths to document damage.",
      "If documenting a hazard at night, ensure you are wearing visible clothing and remain alert of local traffic."
    ]
  },
  cookies: {
    title: "Cookie Policy",
    subtitle: "How we utilize local browser workspaces",
    content: [
      "CivicPulse does not utilize advertising scripts or tracking cookies.",
      "We employ standard HTML5 localStorage space to preserve your custom incident reports and vote actions.",
      "Clearing your browser cache or site data will reset the database mock data values to the system default presets."
    ]
  },
  contact: {
    title: "Contact Us",
    subtitle: "Get in touch with the CivicPulse support crew",
    content: [
      "For administrative reviews or technical support queries, drop us a line at support@civicpulse.org.",
      "Phone: +1 (800) CIVIC-PULSE (Mon-Fri, 9:00 AM - 5:00 PM).",
      "Headquarters: 100 Civic Plaza, Suite 400, Tech City."
    ]
  },
  'report-content': {
    title: "Report Content",
    subtitle: "Flagging duplicates or false entries",
    content: [
      "If you identify a false entry, duplicate marker, or inappropriate photo uploaded onto our grid, please flag it for review.",
      "You can send the issue ID to flag@civicpulse.org for manual coordinate verification and marker pruning.",
      "Thank you for helping us maintain a reliable local tracking workspace."
    ]
  }
};

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params;
  const pageData = CONTENT_MAP[slug];

  if (!pageData) {
    notFound();
  }

  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoContent}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Landing Page</span>
        </Link>

        <article className={`${styles.infoCard} glass`}>
          <header className={styles.header}>
            <h1 className={styles.title}>{pageData.title}</h1>
            <p className={styles.subtitle}>{pageData.subtitle}</p>
          </header>

          <div className={styles.bodyText}>
            {pageData.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>

      <Footer />
    </div>
  );
}
