import React, { useState } from "react";
import "./FooterPages.css";
import logo from "/logo.png";

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <span className="faq-toggle">{isOpen ? "−" : "+"}</span>
      </button>
      <div
        className="faq-answer"
        style={{
          maxHeight: isOpen ? "500px" : "0px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "What is Vara?", a: "Vara is a subscription-based platform offering AI-generated music for creators, businesses, and storytellers. Every track is tagged with genre, sub-genre (mood), BPM, musical key, and vocal info so you can quickly find the perfect fit for your project." },
    { q: "How often do you add new songs?", a: "We update our library weekly with fresh AI-generated tracks." },
    { q: "Can I request custom AI music?", a: "No. At the moment, you can only choose from our existing library." },
    { q: "How does the subscription work?", a: "Monthly plan only. Access to the entire library (free + premium songs). You can download up to 50 songs per month. You can use only one song per video/project." },
    { q: "What happens if I re-download the same song?", a: "It will still count toward your monthly 50-song limit." },
    { q: "What is the free plan?", a: "No subscription required. Access to a limited free songs library. Can download up to 3 free songs per month. Free songs can be used anywhere without a subscription, but the one-song-per-video rule still applies." },
    { q: "Do I keep the songs after my subscription ends?", a: "No. You cannot use downloaded songs in new videos or projects once your subscription ends." },
    { q: "Can I share my account with others?", a: "No. Account sharing is strictly prohibited." },
    { q: "Is the certificate valid worldwide?", a: "Yes — Vara’s certificate allows worldwide use." },
    { q: "Where can I use Vara’s music?", a: "You can use our music in YouTube videos (with other content), social media, podcasts, ads, films, games, client projects, paid ad campaigns, and offline events." },
    { q: "What am I not allowed to do?", a: "❌ Use our music as 'free no copyright music'. ❌ Upload only music without other content. ❌ Remix, modify, or resell. ❌ Share your account. ❌ Screen record songs. ❌ Use the same song in multiple projects without re-download"},
    { q: "What happens if someone falsely claims my music on YouTube?", a: "You can use our certificate verification page and certificate ID to prove your usage rights." },
    { q: "Do all songs show BPM, key, and vocal info?", a: "Yes. You can see this info before downloading." },
    { q: "Can I search by mood or genre?", a: "Yes. We organize songs by Genre (like Motivation, Documentary, Vlog) and Sub-genre (moods like Happy, Sad, Romantic)." },
    { q: "What formats do you offer?", a: "Currently MP3. WAV will be available in the future." },
    { q: "Can I listen before downloading?", a: "Yes — you can listen to full tracks without logging in." },
    { q: "Can I record the preview and use it?", a: "No — screen recording is strictly prohibited." },
    { q: "Do you watermark previews?", a: "We may add light watermarks in streaming previews to prevent misuse. Downloads remain clean." },
    { q: "How do I cancel my subscription?", a: "Currently, there’s no cancellation option." },
    { q: "Do you offer refunds?", a: "No refunds are provided once payment is processed." },
    { q: "How do I contact support?", a: "Through our official social media handles. We respond within 1–2 days." },
    { q: "Warnings", a: "⚠ All music on varamusic.com is AI-generated and distributed under Vara’s certificate. Use without a certificate may lead to third-party claims. Downloads are tagged to your account. Redistribution is forbidden." }
  ];

  return (
    <div className="faq-page">
      <div className="faq-background"></div>
      <header className="faq-header">
        <img src={logo} alt="Vara Logo" className="vara-logo" />
        <h1 className="faq-title">Vara – Frequently Asked Questions</h1>
      </header>

      <div className="faq-content">
        {faqs.map((item, idx) => (
          <AccordionItem key={idx} question={item.q} answer={item.a} />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
