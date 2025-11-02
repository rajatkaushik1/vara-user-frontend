import React from 'react';
import { Linkedin, Instagram, Twitter, CheckCircle2 } from 'lucide-react';
// import { SonicWaveformBackground } from '@/components/ui/sonic-waveform'; // Removed - this component doesn't exist in vara-user-frontend
import './TeamPage.css'; // <-- ADD THIS LINE

export default function TeamPage() { // Renamed function to TeamPage
  // Updated roles and descriptions with distinct apply links
  const roles = [
    {
      title: 'WEB DEVELOPER (REACT)',
      subtitle:
        "Build and manage the code for the VARA website. You'll turn designs into features using React, ensuring our platform is fast, functional, and seamless for every user.",
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSecMkYEFK6Cu9OH5h5BwEw2fW7Htv47PNdwWeMXeP-ZLakwJw/viewform?usp=header'
    },
    {
      title: 'AI MUSIC CREATOR',
      subtitle:
        'Use AI tools to generate, review, and curate our entire music library. Your great knowledge of music will guide AI to produce high-quality tracks and ensure the catalog is perfectly organized.',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSd0uw7JrARQdSO0f1C_pfqQHIHK22N553C7kCXm2skZwfYOgg/viewform?usp=header'
    },
    {
      title: 'MARKETING CREATOR',
      subtitle:
        "Tell VARA's story to the world. You will manage our social media, build a passionate online community, and create excitement to grow our brand.",
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSeh95cOuIZqdT4PnYAC4v85hPba0hLiPbec1DXQYHg1uwycfw/viewform?usp=header'
    }
  ];

  // Benefits list for the new glass rectangle
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
    // Use a simple div container. App.jsx will handle the 'main' layout
    // The 'team-page-container' class will be defined in TeamPage.css
    <div className="team-page-container text-white"> 
      
      {/* REMOVED: <SonicWaveformBackground /> - This component is not in your project.
        REMOVED: <img src="/logo.png" ... /> - App.jsx Header already has a logo.
      */}

      {/* Content */}
      {/* Added padding (py-16) to create space from the main header */}
      <header className="relative z-10 mx-auto max-w-6xl px-6 pt-16 text-center">
        <h1 className="mb-3 font-montserrat text-3xl tracking-[0.18em] text-white/90 md:text-4xl">
          JOIN OUR GROWING TEAM
        </h1>
        <p className="text-lg font-medium text-white/70 md:text-2xl">
          SHAPE THE FUTURE OF AI MUSIC
        </p>

        {/* Job Cards — responsive & equal height */}
        <section
          className="
            mx-auto mt-12 grid max-w-5xl gap-6 px-3
            grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
            auto-rows-fr
          "
        >
          {roles.map((job, i) => (
            <div
              key={i}
              className="
                group relative flex h-full flex-col rounded-2xl
                border border-white/10 bg-black/40 p-6 shadow-card backdrop-blur-md
              "
            >
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <h3
                className="
                  text-left font-extrabold tracking-tight text-white break-words
                  text-base sm:text-lg md:text-xl
                "
              >
                {job.title}
              </h3>

              <p
                className="
                  mt-2 text-left text-white/80
                  text-sm md:text-[15px] leading-relaxed
                "
              >
                {job.subtitle}
              </p>

              <a
                href={job.href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-auto inline-flex items-center justify-center
                  rounded-full bg-amber-500 px-4 py-2
                  text-sm font-semibold text-black
                  transition-colors hover:bg-amber-400
                  focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-black
                "
                aria-label={`Apply now for ${job.title}`}
              >
                APPLY NOW
              </a>
            </div>
          ))}
        </section>

        {/* Benefits — glass rectangle */}
        <section className="mx-auto mt-10 max-w-5xl px-3">
          <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-md md:p-8">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent opacity-40" />
            <div className="relative text-left">
              <h2 className="font-montserrat text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                Here&apos;s what you get as part of the team:
              </h2>

              <ul className="mt-5 grid gap-3 text-sm text-white/80 md:grid-cols-2">
                {benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Know more about VARA — glass rectangle */}
        {/* Added padding-bottom (pb-16) to create space from the main footer */}
        <section className="mx-auto mt-10 max-w-5xl px-3 pb-16">
          <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-md md:p-8">
            {/* subtle gradient sheen */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent opacity-40" />
            <div className="relative grid items-center gap-6 md:grid-cols-12">
              {/* Text left */}
              <div className="text-left md:col-span-8">
                <h2 className="font-montserrat text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                  Know more about VARA
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
                  VARA is an AI-powered music platform delivering high-quality, royalty-free tracks across genres,
                  sub-genres, moods, instruments, BPM, and vocals. Beyond our ever-growing library of AI-generated songs,
                  VARA features the most powerful AI music recommendation chatbot in India and one of the world’s best
                  AI-powered recommendation systems. This assistant helps creators instantly discover the perfect soundtrack
                  for videos, ads, podcasts, games, and more. With the lowest subscription price in the world, VARA makes
                  professional-quality music accessible to everyone, while redefining how creators find and use sound.
                </p>
              </div>
              {/* Logo right (lotus) */}
              <div className="md:col-span-4 flex items-center justify-center md:justify-end">
                <img
                  src="/lotus.png"
                  alt="VARA lotus logo"
                  className="h-24 w-auto opacity-90 drop-shadow-[0_0_25px_rgba(251,191,36,0.30)] md:h-28"
                />
              </div>
            </div>
          </div>
        </section>

        {/* REMOVED: Footer-like area (social links) - App.jsx Footer already has this.
          REMOVED: <footer> (All rights reserved) - App.jsx Footer already has this.
        */}
      </header>
    </div>
  );
}
