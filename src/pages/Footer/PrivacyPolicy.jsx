import React from "react";
import "./FooterPages.css";

const PrivacyPolicy = () => (
  <div className="footer-page-container privacypolicy-page">
    <div className="footer-page-logo-wrapper">
      <img src="/logo.png" alt="VARA Logo" className="footer-page-logo" />
    </div>
    <div className="footer-page-content">
      <h1 className="footer-page-title">Privacy Policy</h1>
      <p className="footer-page-effective-date">Effective Date: 14:09:2025</p>
      <p className="footer-page-website">Website: varamusic.com</p>
      <p className="footer-page-operator">Operator: Vara Music ("we", "our", "us")</p>
      <section className="footer-page-section">
        <h2><span className="section-number">1.</span> Introduction</h2>
        <p>
          At Vara, we respect your privacy. This Privacy Policy explains how we collect, 
          use, and protect your personal information when you use our website, subscription 
          services, and music library. By using Vara, you agree to the terms described below.
        </p>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">2.</span> Information We Collect</h2>
        <h3>A. Information You Provide via Google Login</h3>
        <p>
          When you log in using Google Sign-In, we receive the following information from 
          your Google account:
        </p>
        <ul>
          <li>Your name</li>
          <li>Your Gmail address</li>
          <li>Your Google profile picture</li>
        </ul>
        <p>We do not collect your password or any other sensitive account details from Google.</p>
        <h3>B. Information We Collect Automatically</h3>
        <ul>
          <li>Usage data: Pages visited, music previewed, downloads made.</li>
          <li>Device info: Browser type, IP address, operating system.</li>
          <li>Cookies: Small text files to improve site performance and remember preferences.</li>
        </ul>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">3.</span> How We Use Your Information</h2>
        <ul>
          <li>Provide you with access to our music library.</li>
          <li>Issue license IDs for your downloads.</li>
          <li>Personalize your account experience.</li>
          <li>Improve site performance and user experience.</li>
          <li>Detect and prevent misuse, piracy, or account sharing.</li>
        </ul>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">4.</span> Sharing Your Information</h2>
        <p>We do not sell or share your personal details with third parties except:</p>
        <ul>
          <li>With legal authorities if required by law or in cases of license violations.</li>
          <li>With service providers strictly for operating our website.</li>
        </ul>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">5.</span> Data Retention</h2>
        <p>
          We keep your account details as long as your subscription is active. If your account 
          is canceled, we may retain your download history for up to 12 months for fraud 
          prevention and license verification.
        </p>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">6.</span> Your Rights</h2>
        <ul>
          <li>Request a copy of your personal data.</li>
          <li>Request deletion of your account and data.</li>
          <li>Opt out of marketing emails.</li>
        </ul>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">7.</span> Cookies</h2>
        <ul>
          <li>Login/session management</li>
          <li>Preferences (e.g., light/dark mode)</li>
          <li>Analytics (to improve our library)</li>
        </ul>
        <p>
          You can disable cookies in your browser, but some features may not work.
        </p>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">8.</span> Security</h2>
        <p>
          We use encryption, firewalls, and secure servers to protect your information. However, 
          no method of transmission is 100% secure, and you use our service at your own risk.
        </p>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">9.</span> Children’s Privacy</h2>
        <p>
          Vara is not intended for users under 13. We do not knowingly collect personal data from children.
        </p>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">10.</span> Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted here 
          with a revised “Effective Date.”
        </p>
      </section>
      <section className="footer-page-section">
        <h2><span className="section-number">11.</span> Contact Us</h2>
        <p>
          📧 rajatrajkaushik1@gmail.com<br />
          🌐 varamusic.com
        </p>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy;