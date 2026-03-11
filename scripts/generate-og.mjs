/**
 * Generates public/og-image.png (1200×630) from an inline SVG.
 * Run with:  node scripts/generate-og.mjs
 * Requires:  @resvg/resvg-js  (dev dependency)
 */
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Subtle grid -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
    <!-- Ambient glow -->
    <radialGradient id="glow" cx="25%" cy="45%" r="65%">
      <stop offset="0%"   stop-color="#22d3ee" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#0f172a"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <ellipse cx="300" cy="280" rx="560" ry="420" fill="url(#glow)"/>

  <!-- Logo icon box -->
  <rect x="80" y="72" width="56" height="56" rx="14" fill="#22d3ee"/>
  <!-- Lightning bolt (scaled from 24×24 viewBox) -->
  <g transform="translate(88,80) scale(1.667)">
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" fill="white"/>
  </g>

  <!-- Brand name -->
  <text x="152" y="112" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="34" font-weight="700" fill="white" letter-spacing="-0.5">MockAPI</text>

  <!-- Domain (top-right) -->
  <text x="1120" y="112" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="22" fill="#475569" text-anchor="end">mockapi.store</text>

  <!-- Headline line 1 -->
  <text x="80" y="258" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="74" font-weight="800" fill="white" letter-spacing="-2">Mock APIs in seconds,</text>

  <!-- Headline line 2 (accent colour) -->
  <text x="80" y="352" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="74" font-weight="800" fill="#22d3ee" letter-spacing="-2">not hours.</text>

  <!-- Description -->
  <text x="80" y="424" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="27" fill="#94a3b8">Create live HTTP endpoints instantly — custom JSON responses,</text>
  <text x="80" y="462" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="27" fill="#94a3b8">status codes, and delays. Free forever.</text>

  <!-- HTTP method badges -->
  <rect x="80"  y="516" width="72"  height="38" rx="8" fill="#14432a"/>
  <text x="116" y="541" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="15" font-weight="700" fill="#4ade80" text-anchor="middle">GET</text>

  <rect x="164" y="516" width="82"  height="38" rx="8" fill="#3b2f05"/>
  <text x="205" y="541" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="15" font-weight="700" fill="#facc15" text-anchor="middle">POST</text>

  <rect x="258" y="516" width="72"  height="38" rx="8" fill="#0c2a4a"/>
  <text x="294" y="541" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="15" font-weight="700" fill="#60a5fa" text-anchor="middle">PUT</text>

  <rect x="342" y="516" width="96"  height="38" rx="8" fill="#2a1c4a"/>
  <text x="390" y="541" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="15" font-weight="700" fill="#a78bfa" text-anchor="middle">PATCH</text>

  <rect x="450" y="516" width="102" height="38" rx="8" fill="#3b0e0e"/>
  <text x="501" y="541" font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="15" font-weight="700" fill="#f87171" text-anchor="middle">DELETE</text>
</svg>
`.trim();

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
const png   = resvg.render().asPng();

const out = path.join(__dirname, '..', 'public', 'og-image.png');
writeFileSync(out, png);
console.log(`✓ OG image → ${out} (${(png.length / 1024).toFixed(1)} KB)`);
