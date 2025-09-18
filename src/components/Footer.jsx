import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ onPremiumClick }) => {
    // Array of links for easier management
    const quickLinks1 = [
        { name: 'Premium Pricing', path: '/premium' },
        { name: 'FAQ', path: '/faq' },
        { name: 'About Us', path: '/about' },
    ];

    const quickLinks2 = [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'License Agreement', path: '/license' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Left side with logo and lotus image */}
                <div className="footer-left">
                    <img src="/lotus-footer-image.png" alt="Lotus decoration" className="footer-lotus-image" />
                    <img src="/logo.png" alt="VARA Logo" className="footer-logo" />
                </div>

                {/* Right side with links and text */}
                <div className="footer-right">
                    <p className="footer-tagline">
                        Made with ❤️ and a little bit of 🎵 magic for creators everywhere.
                    </p>

                    <div className="footer-links-section">
                        <h3 className="footer-links-title">Quick Links</h3>
                        <div className="footer-links-container">
                            <ul className="footer-links-column">
                                {quickLinks1.map((link) => (
                                    <li key={link.name}>
                                        {link.name === 'Premium Pricing' ? (
                                            <a
                                                href="#"
                                                className="footer-link"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    onPremiumClick && onPremiumClick();
                                                }}
                                            >
                                                {link.name}
                                            </a>
                                        ) : (
                                            <Link
                                                to={link.path}
                                                className="footer-link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <ul className="footer-links-column">
                                {quickLinks2.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.path}
                                            className="footer-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link
                                        to="/license-verification"
                                        className="lv-hover"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        License Verification
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom copyright notice */}
            <div className="footer-bottom">
                <div className="footer-disclaimer" style={{ color: '#ebba2f', fontSize: '1em', marginBottom: '18px', fontWeight: 500 }}>
                    ⚠️ All music on varamusic.com is AI-generated and licensed under VARA’s proprietary license. Each license grants usage of a track in one project only. Redistribution, resale, or uploading full tracks elsewhere is strictly prohibited and may lead to legal action. VARA issues licenses independently and is not affiliated with ASCAP, BMI, or any government body.
                </div>
                <p className="footer-copyright">
                    © {new Date().getFullYear()} Vara. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
