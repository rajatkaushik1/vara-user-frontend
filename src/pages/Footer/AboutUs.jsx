import React from "react";
import "./FooterPages.css";

const AboutUs = () => (
  <div className="footer-page-container aboutus-page">
    <div className="footer-page-logo-wrapper">
      <img src="/logo.png" alt="VARA Logo" className="footer-page-logo" />
    </div>
    <div className="footer-page-content">
      <h1 className="footer-page-title">About Vara</h1>
      <section>
        <p>
          At Vara, we believe music should be limitless — not limited by
          copyright headaches, expensive licensing, or endless searches for
          the “perfect” track.
        </p>
        <p>
          We’re a subscription-based AI music platform built for creators,
          filmmakers, businesses, and storytellers who need high-quality,
          ready-to-use music without the legal uncertainty.
        </p>
      </section>
      <section>
        <h2 className="footer-page-section-title">What We Do</h2>
        <p>
          Our AI generates music across multiple genres, moods, and styles —
          from motivational beats to romantic soundscapes, from documentary
          background scores to cinematic trailers.
        </p>
        <p>Every track comes with:</p>
        <ul>
          <li>BPM (Beats Per Minute)</li>
          <li>Musical Key</li>
          <li>
            Vocal Information (so you know if the song has vocals or is
            instrumental)
          </li>
          <li>
            Genre & Sub-Genre Tags (so you can search by YouTube categories
            or mood)
          </li>
        </ul>
        <p>
          We update our library every week, giving you fresh music so your
          content never feels repetitive.
        </p>
      </section>
      <section>
        <h2 className="footer-page-section-title">Why Vara Exists</h2>
        <p>We know the struggle:</p>
        <ul>
          <li>
            Hours lost searching for “royalty-free” music that still triggers
            copyright claims
          </li>
          <li>Confusing certificate terms that scare away creators</li>
          <li>High costs for even a single track</li>
        </ul>
        <p>
          Vara changes that. With one simple subscription, you can access our
          entire library and download up to 50 songs per month — each ready
          for commercial use under our certificate.
        </p>
      </section>
      <section>
        <h2 className="footer-page-section-title">Our Promise</h2>
        <ul>
          <li>
            ✅ <strong>Clarity</strong> — Simple, plain-language rules so you
            always know what you can (and can’t) do with our music.
          </li>
          <li>
            ✅ <strong>Quality</strong> — AI-generated, human-checked tracks
            so you don’t waste time sorting through filler.
          </li>
          <li>
            ✅ <strong>Protection</strong> — certificate verification for
            platforms like YouTube, Instagram, and Facebook to avoid false
            claims.
          </li>
          <li>
            ✅ <strong>Freedom</strong> — Worldwide usage rights for social
            media, ads, podcasts, games, films, and more.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="footer-page-section-title">The Vara Vision</h2>
        <p>
          We’re here to empower creators — whether you’re a solo YouTuber, an
          agency editing for clients, a filmmaker, or a marketer running ads.
        </p>
        <p>
          No confusing contracts. No surprise copyright strikes. Just music
          you can trust.
        </p>
        <p>
          At Vara, we’re not just building a library — we’re building a
          creative safety net so your projects can shine without worry.
        </p>
      </section>
      <section>
        <h2 className="footer-page-section-title">Join the Movement</h2>
        <p>
          Your competition is already discovering the ease of AI-generated
          music with Vara.
        </p>
      </section>
    </div>
  </div>
);

export default AboutUs;