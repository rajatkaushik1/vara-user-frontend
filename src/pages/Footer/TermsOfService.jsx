import React from "react";
import "./FooterPages.css";

const TermsOfService = () => (
  <div className="footer-page-container termsofservice-page">
    <div className="footer-page-logo-wrapper">
      <img src="/logo.png" alt="VARA Logo" className="footer-page-logo" />
    </div>
    <div className="footer-page-content">
      <h1 className="footer-page-title">Vara Music – Terms of Service</h1>
      <p className="footer-page-date">Effective Date: 14:09:2025</p>
      <p>
        Welcome to Vara Music. By accessing or using our website (varamusic.com) or
        any of our services, you agree to follow and be bound by these Terms of
        Service. If you do not agree, please do not use Vara Music.
      </p>
      <h2><span className="gold-number">1.</span> About Vara Music</h2>
      <p>
        Vara Music provides AI-generated royalty-free music under our proprietary
        license for creators, businesses, and individuals. Users can stream music
        for free, and depending on their subscription, download and use tracks under
        specific terms.
      </p>
      <h2><span className="gold-number">2.</span> Accounts & Access</h2>
      <ul>
        <li>You can browse and stream songs without logging in.</li>
        <li>To download songs, you must log in using Google Sign-In.</li>
        <li>
          Upon login, we collect your name, email address, and profile picture from
          your Google account. We do not share this data with third parties.
        </li>
        <li>You are responsible for keeping your login details secure and must not share your account with others.</li>
      </ul>
      <h2><span className="gold-number">3.</span> Subscription Plans & Download Limits</h2>
      <p><strong>Free Plan:</strong></p>
      <ul>
        <li>Access to free songs library.</li>
        <li>Maximum 3 downloads per month from free songs library.</li>
        <li>Songs can be used anywhere, including paid campaigns.</li>
      </ul>
      <p><strong>Premium Plan:</strong></p>
      <ul>
        <li>Access to both free and premium songs libraries.</li>
        <li>Maximum 50 downloads per month from both libraries combined.</li>
        <li>Includes WAV format (coming soon).</li>
        <li>
          Download counts are per song title, not per file — downloading the same
          song multiple times still counts towards your limit.
        </li>
      </ul>
      <h2><span className="gold-number">4.</span> Usage License</h2>
      <ul>
        <li>
          When you download a song, you are granted a non-exclusive or exclusive
          license (depending on your purchase or subscription).
        </li>
        <li>Each download grants one-time use of that song in a single project/video.</li>
        <li>For offline use, the license is unlimited for that specific project.</li>
        <li>Redistribution, resale, or re-upload of full tracks is strictly prohibited.</li>
        <li>Screen recording of music streams is prohibited.</li>
      </ul>
      <h2><span className="gold-number">5.</span> Prohibited Activities</h2>
      <ul>
        <li>Share your account with others.</li>
        <li>Use automated tools to download songs in bulk.</li>
        <li>Upload Vara Music tracks to “No Copyright” or similar music libraries.</li>
        <li>Remove or alter any embedded tags or identifiers in our files.</li>
      </ul>
      <h2><span className="gold-number">6.</span> Warnings & Enforcement</h2>
      <p>
        ⚠ All music on varamusic.com is AI-generated and distributed under Vara’s
        proprietary license. Use without a valid license may result in third-party
        claims, for which Vara is not responsible.
      </p>
      <p>
        Important: “This download is tagged to your account. Redistribution of full
        tracks is strictly monitored and forbidden. Violators risk permanent
        suspension.”
      </p>
      <h2><span className="gold-number">7.</span> Refund Policy</h2>
      <p>
        Due to the nature of digital content, all sales and subscriptions are final.
      </p>
      <p>
        If you face technical issues, contact us for assistance before requesting a
        refund.
      </p>
      <h2><span className="gold-number">8.</span> Changes to These Terms</h2>
      <p>
        We may update these Terms at any time. Updated versions will be posted on
        this page with a new “Effective Date.” Continued use of Vara Music means you
        accept the changes.
      </p>
      <h2><span className="gold-number">9.</span> Contact Us</h2>
      <p>
        For questions about these Terms:<br />
        📧 Email: <a href="mailto:rajatrajkaushik1@gmail.com" className="gold-link">rajatrajkaushik1@gmail.com</a><br />
        🌐 Website: <a href="https://varamusic.com" className="gold-link">varamusic.com</a>
      </p>
    </div>
  </div>
);

export default TermsOfService;
