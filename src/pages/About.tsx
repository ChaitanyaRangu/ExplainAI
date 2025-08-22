import React, { useState } from 'react';

const CONTACT = {
  name: 'Chaitanya Rangu',
  title: 'Machine Learning & AI Engineer',
  email: 'chaitanyar.online@gmail.com',
  linkedin: 'https://www.linkedin.com/in/chaitanyarangu/',
  github: 'https://github.com/ChaitanyaRangu',
  location: 'Remote (UTC+5:30)'
};

function copy(text: string) {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard API not available'));
}

export default function AboutPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const doCopy = (label: string, text: string) => {
    copy(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {
      setCopied('error');
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const allDetails = `${CONTACT.name}\n${CONTACT.title}\n${CONTACT.email}\n${CONTACT.linkedin}\n${CONTACT.github}`;

  return (
    <div style={{ padding: 24, color: '#e6eef8' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 18 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>{CONTACT.name}</h1>
            <div style={{ color: '#9fb0c8', marginTop: 6 }}>{CONTACT.title} • {CONTACT.location}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href={`mailto:${CONTACT.email}`} style={{ color: '#e6eef8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 8 }}>Email</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" style={{ color: '#9fb0c8', textDecoration: 'none' }}>LinkedIn</a>
            <a href={CONTACT.github} target="_blank" rel="noreferrer" style={{ color: '#9fb0c8', textDecoration: 'none' }}>GitHub</a>
          </div>
        </header>

        <section style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <h2 style={{ marginTop: 0 }}>About</h2>
          <p style={{ color: '#cbd5e1' }}>
            I'm a Machine Learning and AI engineer focused on building interpretable educational visualizations and tooling that make complex models understandable. I design and implement interactive demos, explanatory visualizations, and concise teaching material for ML concepts.
          </p>

          <h3 style={{ marginBottom: 6 }}>Expertise</h3>
          <ul style={{ color: '#cbd5e1' }}>
            <li>Supervised learning (regression, decision trees, ensembles)</li>
            <li>Unsupervised learning & clustering</li>
            <li>Foundations of transformers and attention mechanisms</li>
            <li>Interactive visualizations (D3, Plotly) and educational tooling</li>
          </ul>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
            <h3 style={{ marginTop: 0 }}>Work & collaboration</h3>
            <p style={{ color: '#cbd5e1' }}>
              I collaborate on projects that need clear explanations for ML behavior, educational content, prototype dashboards, and interactive visualizations for non-expert audiences. I am available for short consulting engagements and prototyping work.
            </p>

            <h4 style={{ marginBottom: 6 }}>Typical engagements</h4>
            <ul style={{ color: '#cbd5e1' }}>
              <li>Proof-of-concept visualizations and teaching tools</li>
              <li>Model interpretability reports and demos</li>
              <li>Hands-on workshops and curriculum material</li>
            </ul>
          </div>

          <aside style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontWeight: 700 }}>{CONTACT.email}</div>
            <div style={{ color: '#9fb0c8', marginTop: 8 }}>{CONTACT.linkedin}</div>
            <div style={{ color: '#9fb0c8', marginTop: 6 }}>{CONTACT.github}</div>

            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <button onClick={() => doCopy('email', CONTACT.email)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)' }} aria-label="Copy email">Copy email</button>
              <button onClick={() => doCopy('linkedin', CONTACT.linkedin)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)' }} aria-label="Copy linkedin">Copy LinkedIn</button>
              <button onClick={() => doCopy('github', CONTACT.github)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)' }} aria-label="Copy github">Copy GitHub</button>
              <button onClick={() => doCopy('all', allDetails)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)' }} aria-label="Copy all">Copy all details</button>
            </div>

            <div style={{ marginTop: 8, color: '#9fb0c8' }}>{copied === 'error' ? 'Copy failed' : (copied ? `Copied ${copied}` : '')}</div>
          </aside>
        </section>

        <footer style={{ color: '#94a3b8', paddingTop: 8 }}>
          <small>Thank you for visiting — if you're contacting about a collaboration, include a short description and your timeline.</small>
        </footer>
      </div>
    </div>
  );
}
