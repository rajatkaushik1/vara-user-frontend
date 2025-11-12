import React, { useEffect, useMemo } from 'react';

function getEmailLocalPart(email = '') {
  if (typeof email !== 'string') return '';
  const idx = email.indexOf('@');
  return idx > 0 ? email.slice(0, idx) : email;
}

const isValidHttpUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function FeedbackPage({ currentUser }) {
  // Read the external form URL and optional param keys from env
  const baseFormUrl = (import.meta?.env?.VITE_FEEDBACK_FORM_URL || '').trim();
  const nameKey = (import.meta?.env?.VITE_FEEDBACK_NAME_PARAM || 'name').trim();
  const emailKey = (import.meta?.env?.VITE_FEEDBACK_EMAIL_PARAM || 'email').trim();

  // Build final URL with optional prefill params
  const finalUrl = useMemo(() => {
    const fallback = 'https://docs.google.com/forms/d/e/1FAIpQLSedy_cdszhUDhfw-OjpVeL1loBUam1UT3Y7RulQShcyQIHozQ/viewform';
    const base = isValidHttpUrl(baseFormUrl) ? baseFormUrl : fallback;

    const url = new URL(base);

    // Prefill values (friendly fallback for name)
    const displayName = currentUser?.name?.trim()
      || getEmailLocalPart(currentUser?.email || '')
      || '';

    if (displayName && nameKey) url.searchParams.set(nameKey, displayName);
    if (currentUser?.email && emailKey) url.searchParams.set(emailKey, currentUser.email);

    // Optional: include a basic ref marker
    url.searchParams.set('ref', 'hero');

    return url.toString();
  }, [baseFormUrl, nameKey, emailKey, currentUser]);

  useEffect(() => {
    if (!isValidHttpUrl(baseFormUrl)) {
      console.warn('VITE_FEEDBACK_FORM_URL is missing or invalid. Using a placeholder. Update .env.local with your real Google Form/Typeform URL.');
    }
    // small delay to paint fallback first on very slow devices
    const t = setTimeout(() => {
      try {
        window.location.replace(finalUrl);
      } catch (e) {
        console.warn('Redirect to external form was blocked. Showing fallback link.', e);
      }
    }, 120);
    return () => clearTimeout(t);
  }, [finalUrl, baseFormUrl]);

  return (
    <div style={{
      minHeight: '50vh',
      display: 'grid',
      placeItems: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: 720,
        padding: '24px',
        borderRadius: 16,
        border: '1px solid rgba(235,186,47,0.35)',
        background: 'rgba(0,0,0,0.45)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
      }}>
        <h1 style={{ margin: '0 0 6px 0', fontFamily: 'Montserrat, sans-serif', color: '#ebba2f' }}>
          Help us improve VARA
        </h1>
        {currentUser?.email ? (
          <p style={{ margin: '4px 0 14px 0', color: '#b0b0b0' }}>
            Signed in as <strong style={{ color: '#fff' }}>
              {currentUser?.name?.trim() || getEmailLocalPart(currentUser.email)}
            </strong> ({currentUser.email})
          </p>
        ) : (
          <p style={{ margin: '4px 0 14px 0', color: '#b0b0b0' }}>
            You’re not signed in. You can still leave feedback on the external form.
          </p>
        )}

        <p style={{ margin: '0 0 18px 0', color: '#cfcfcf' }}>
          Redirecting you to our feedback form… If nothing happens,
          click the button below.
        </p>

        <a
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#ebba2f',
            color: '#1a1a1a',
            fontWeight: 800,
            fontFamily: 'Montserrat, sans-serif',
            borderRadius: 30,
            padding: '12px 22px',
            textDecoration: 'none',
            boxShadow: '0 5px 15px rgba(235,186,47,0.35)'
          }}
        >
          Open the form
        </a>


      </div>
    </div>
  );
}
