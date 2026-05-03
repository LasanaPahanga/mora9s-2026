import { Helmet } from "react-helmet-async";

const SITE_NAME = "Mora 9s 2026";
const BASE_URL = "https://www.mora9s.live";
const DEFAULT_IMAGE = `${BASE_URL}/assets/og-image.png`;

/**
 * SEO component — injects page-specific <title> and <meta> tags via react-helmet-async.
 * @param {string} title       - Page-specific title (appended with site name)
 * @param {string} description - Page-specific meta description (keep under 160 chars)
 * @param {string} path        - Route path e.g. "/matches" (used for canonical URL)
 * @param {string} image       - OG image URL (defaults to site-wide OG image)
 */
function SEO({ title, description, path = "/", image = DEFAULT_IMAGE }) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />
    </Helmet>
  );
}

export default SEO;
