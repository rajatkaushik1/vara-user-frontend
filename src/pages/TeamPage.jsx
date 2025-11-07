import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './Team.css';

export default function TeamPage() {
  const roles = [
    
    {
      title: 'AI MUSIC CREATOR',
      subtitle:
        'Use AI tools to generate, review, and curate our entire music library. Your great knowledge of music will guide AI to produce high-quality tracks and ensure the catalog is perfectly organized.',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSd0uw7JrARQdSO0f1C_pfqQHIHK22N553C7kCXm2skZwfYOgg/viewform?usp=header'
    }
  ];

  const benefits = [
    'Certificate of Contribution',
    'Direct participation in all team meetings with so much to learn',
    'Your name and work featured on our official team webpage',
    'A strong Letter of Recommendation from VARA',
    'Free access to top paid AI tools',
    'Strong LinkedIn & Instagram endorsements from the official accounts',
    'A "chill" culture with no workload (even more relaxed than Google!)',
    'Team parties',
    'Future salaried positions can be offered in future.',
    'Attendance will be rewarded'
  ];

  return (
    <div className="team-page-container">
      <header className="team-header">
        <h1 className="team-title">JOIN OUR GROWING TEAM</h1>
        <p className="team-subtitle">SHAPE THE FUTURE OF AI MUSIC</p>

        {/* Job Cards */}
        <section className="jobs-grid">
          {roles.map((job, i) => (
            <div key={i} className="job-card">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-description">{job.subtitle}</p>
              <a
                href={job.href}
                target="_blank"
                rel="noopener noreferrer"
                className="job-apply-btn"
                aria-label={`Apply now for ${job.title}`}
              >
                APPLY NOW
              </a>
            </div>
          ))}
        </section>

        {/* Benefits */}
        <section className="benefits-section">
          <div className="benefits-card">
            <div className="benefits-content">
              <h2 className="benefits-title">Here&apos;s what you get as part of the team:</h2>
              <ul className="benefits-list">
                {benefits.map((item, idx) => (
                  <li key={idx} className="benefit-item">
                    <CheckCircle2 className="benefit-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Know More */}
        <section className="know-more-section">
          <div className="know-more-card">
            <div className="know-more-content">
              <div className="know-more-text">
                <h2 className="know-more-title">Know more about VARA</h2>
                <p className="know-more-description">
                  VARA is an AI-powered music platform delivering high-quality, royalty-free tracks across genres,
                  sub-genres, moods, instruments, BPM, and vocals. Beyond our ever-growing library of AI-generated songs,
                  VARA features the most powerful AI music recommendation chatbot in India and one of the world's best
                  AI-powered recommendation systems. This assistant helps creators instantly discover the perfect soundtrack
                  for videos, ads, podcasts, games, and more. With the lowest subscription price in the world, VARA makes
                  professional-quality music accessible to everyone, while redefining how creators find and use sound.
                </p>
              </div>
              <div className="know-more-logo-wrapper">
                <img
                  src="/lotus.png"
                  alt="VARA lotus logo"
                  className="know-more-logo"
                />
              </div>
            </div>
          </div>
        </section>
      </header>
    </div>
  );
}
