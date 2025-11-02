import React from "react";
import "./FooterPages.css";

const LicenseAgreement = () => (
  <div className="footer-page-container licenseagreement-page">
    <div className="footer-page-logo-wrapper">
      <img src="/logo.png" alt="VARA Logo" className="footer-page-logo" />
    </div>
    <div className="footer-page-content">
      <h1 className="footer-page-title">Vara Music – Certificate Agreement</h1>
      <p className="footer-page-date">Effective Date: 14:09:2025</p>
      <section>
        <h2><span className="gold-number">1.</span> Certificate Grant</h2>
        <p>
          Vara Music grants you a non-exclusive, non-transferable certificate to use AI-generated music tracks downloaded from varamusic.com in your creative projects, subject to the terms below.
        </p>
      </section>
      <section>
        <h2><span className="gold-number">2.</span> Permitted Uses</h2>
        <ul>
          <li>Use in YouTube videos, podcasts, social media, ads, films, games, client projects, and paid campaigns.</li>
          <li>One song per project/video per download.</li>
          <li>Worldwide usage rights.</li>
        </ul>
      </section>
      <section>
        <h2><span className="gold-number">3.</span> Restrictions</h2>
        <ul>
          <li>Redistribution, resale, or re-upload of full tracks is strictly prohibited.</li>
          <li>Screen recording of music streams is prohibited.</li>
          <li>Uploading tracks to “No Copyright” or similar libraries is forbidden.</li>
          <li>Account sharing is not allowed.</li>
        </ul>
      </section>
      <section>
        <h2><span className="gold-number">4.</span> Certificate ID & Verification</h2>
        <p>
          Each download is tagged to your account and assigned a certificate ID. Use this ID for certificate verification on platforms like YouTube.
        </p>
      </section>
      <section>
        <h2><span className="gold-number">5.</span> Termination</h2>
        <p>
          Vara reserves the right to terminate your certificate and account for violations of these terms.
        </p>
      </section>
      <section>
        <h2><span className="gold-number">6.</span> Contact</h2>
        <p>
          For certificate questions:<br />
          📧 rajatrajkaushik1@gmail.com<br />
          🌐 varamusic.com
        </p>
      </section>
    </div>
  </div>
);

export default LicenseAgreement;
