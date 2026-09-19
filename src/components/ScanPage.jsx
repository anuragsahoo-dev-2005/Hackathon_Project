import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, ExternalLink, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SathiCompanion from './Sathi/SathiCompanion';

function getSiteUrl() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.href.replace(/\/$/, '');
    } catch {
      // Fall back to the page origin when the optional environment value is invalid.
    }
  }
  return window.location.origin;
}

export default function ScanPage() {
  const [copied, setCopied] = useState(false);
  const siteUrl = getSiteUrl();
  const isLocalAddress = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-cream px-4 py-6 text-charcoal sm:px-8 sm:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col items-center justify-center text-center">
        <a href="/" className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-pill border border-charcoal/15 bg-warm-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-terracotta hover:text-terracotta">
          <ArrowLeft size={17} /> Back to Smriti Sathi
        </a>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-light text-terracotta">
          <Smartphone size={28} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-terracotta">Smriti Sathi on your phone</p>
        <h1 className="mt-3 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">Scan to try Smriti Sathi on your phone.</h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-charcoal/70 sm:text-lg">
          Open your camera, point it at the code, and start a gentle memory activity wherever you are.
        </p>

        <div className="mt-8 rounded-card border-4 border-terracotta bg-warm-white p-3 shadow-warm-lg sm:p-7">
          <div className="rounded-soft bg-white p-2 sm:p-4">
            <QRCodeSVG value={siteUrl} size={300} level="H" includeMargin bgColor="#FFFFFF" fgColor="#2B2420" aria-label={`QR code for ${siteUrl}`} />
          </div>
        </div>
        <p className="mt-5 max-w-full break-all text-xs text-charcoal/55">{siteUrl}</p>
        {isLocalAddress && (
          <p className="mt-3 max-w-lg rounded-soft border border-gold/40 bg-gold-light/40 px-4 py-3 text-xs leading-relaxed text-charcoal/75">
            This address only works on this computer. To scan from a phone, open this page using your computer&apos;s Wi-Fi address or set <strong>VITE_SITE_URL</strong> to a public HTTPS URL before building.
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={copyUrl}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-charcoal/20 bg-warm-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-terracotta hover:text-terracotta"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-terracotta px-4 py-2 text-sm font-semibold text-warm-white transition hover:bg-terracotta-hover"
          >
            <ExternalLink size={16} /> Open link
          </a>
        </div>
        </div>
      </main>
      <SathiCompanion
        onCloseAllViews={() => window.location.assign('/')}
        onOpenGame={() => window.location.assign('/#for-seniors')}
        onOpenGameChooser={() => window.location.assign('/#for-seniors')}
        onOpenDashboard={() => window.location.assign('/#for-caregivers')}
        onOpenSequenceGame={() => window.location.assign('/#for-seniors')}
        onOpenRecognitionGame={() => window.location.assign('/#for-seniors')}
        onOpenWhichChangedGame={() => window.location.assign('/#for-seniors')}
        isGameOpen={false}
      />
    </>
  );
}
