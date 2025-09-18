'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

// --- TYPE DEFINITION ---
// Defines the structure for each persona's data.
// interface PersonaData {
//   title: string;
//   name: string;
//   image: string; // e.g., "/assets/alex.png"
//   hook: string;
//   roadmap_description: string;
//   roadmap_modules: string[];
//   roadmap_image: string; // e.g., "/assets/roadmap-alex.png"
//   opted: {
//     option: 'newsletter' | 'ebook';
//     text: string;
//   };
// }

// --- MOCK DATA ---
// This data should be moved to 'assets/how_it_works.json' and fetched.
// For this example, it's included directly in the component.
// const howItWorksData: PersonaData[] = [
//   {
//     title: "The Ambitious Student",
//     name: "Alex",
//     image: "/assets/persona-student.png", // Placeholder path
//     hook: "Alex is a final-year university student, eager to land a top-tier job post-graduation but unsure how to navigate the competitive landscape.",
//     roadmap_description: "We generated a personalized career roadmap for Alex, focusing on skill-building in the final semester, targeted networking, and interview preparation.",
//     roadmap_image: "/assets/roadmap-generic.png", // Placeholder path
//     opted: {
//       option: 'newsletter',
//       text: "To stay updated with the latest industry trends and job openings, Alex subscribed to our curated weekly newsletter."
//     }
//   },
//   {
//     title: "The Career Changer",
//     name: "Priya",
//     image: "/assets/persona-changer.png", // Placeholder path
//     hook: "Priya has been in marketing for 8 years but wants to transition into data science. She needs a clear path to bridge her skills gap.",
//     roadmap_description: "Priya's roadmap identified key data science certifications, project-based learning opportunities, and how to leverage her marketing experience.",
//     roadmap_image: "/assets/roadmap-generic.png", // Placeholder path
//     opted: {
//       option: 'ebook',
//       text: "For a deep, comprehensive guide, Priya opted for the instant eBook, giving her all the information she needed in one place."
//     }
//   },
//   {
//     title: "The Freelance Creative",
//     name: "Ben",
//     image: "/assets/persona-freelancer.png", // Placeholder path
//     hook: "Ben is a talented graphic designer who wants to scale his freelance business but struggles with finding high-value clients consistently.",
//     roadmap_description: "We provided Ben a roadmap focused on portfolio enhancement, pricing strategies, and lead generation techniques to attract premium clients.",
//     roadmap_image: "/assets/roadmap-generic.png", // Placeholder path
//     opted: {
//       option: 'ebook',
//       text: "Ben needed a complete A-Z strategy. The instant eBook became his go-to resource for building a successful freelance empire."
//     }
//   },
//   {
//     title: "The Tech Entrepreneur",
//     name: "Samira",
//     image: "/assets/persona-entrepreneur.png", // Placeholder path
//     hook: "Samira has a brilliant idea for a tech startup but is overwhelmed by the process of turning her vision into a viable product.",
//     roadmap_description: "Samira's roadmap outlined steps for market research, MVP development, and securing initial funding, breaking down the daunting journey.",
//     roadmap_image: "/assets/roadmap-generic.png", // Placeholder path
//     opted: {
//       option: 'newsletter',
//       text: "To keep a pulse on the startup ecosystem and funding alerts, Samira chose the newsletter for timely, actionable insights."
//     }
//   }
// ];
import howItWorksData from '@/assets/how_it_works.json';

// --- MAIN COMPONENT ---
const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % howItWorksData.length);
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered]);

  const activePersona = howItWorksData[activeIndex];

  const contentVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } },
  };

  return (
    <section
      className="w-full bg-background text-foreground font-sans p-6 md:p-10 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SECTION HEADING */}
      <h2 className="text-4xl md:text-5xl font-display text-center text-secondary mb-4 flex-shrink-0">
        How It Works
      </h2>

      {/* TOP: Persona Buttons */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-6 flex-shrink-0">
        {howItWorksData.map((persona, index) => (
          <button
            key={persona.title}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 rounded-full text-xs md:text-base font-semibold transition-all duration-300 ease-in-out font-display
              ${activeIndex === index
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border-2 border-border'
              }`}
          >
            {persona.title}
          </button>
        ))}
      </div>

      {/* BOTTOM: SCROLLABLE Persona Details */}
      <div className="flex-grow overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-5xl mx-auto space-y-6 md:space-y-4 py-2"
          >
            {/* 1. Persona Introduction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex flex-col items-center">
                <div className="w-36 h-36 rounded-full bg-secondary/20 border-4 border-secondary/50 mb-2 flex items-center justify-center overflow-hidden">
                  <Image
                    src={activePersona.image}
                    alt={activePersona.name}
                    width={144}
                    height={144}
                    className="w-full h-full object-cover rounded-full"
                    priority={activeIndex === 0}
                    onError={(e) => {
                      console.log('Image failed to load:', activePersona.image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <h3 className="text-xl font-display text-secondary">{activePersona.name}</h3>
              </div>
              <p className="text-base md:text-lg text-foreground/80 leading-snug text-center md:text-left">
                {activePersona.hook}
              </p>
            </div>

            {/* 2. Roadmap Generation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <p className="text-base md:text-lg text-foreground/80 leading-snug text-center md:text-left order-2 md:order-1">
                {activePersona.roadmap_description}
              </p>
              <div className="flex flex-col items-center order-1 md:order-2">
                <div className="w-full bg-secondary-foreground border border-secondary rounded-lg overflow-hidden">
                  {activePersona.roadmap_modules.map((module, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 text-sm text-foreground/90 ${index < activePersona.roadmap_modules.length - 1 ? 'border-b border-secondary' : ''}`}
                    >
                      {module}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Option Chosen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="flex justify-center gap-4">
                <div className={`p-4 rounded-lg border-2 w-36 text-center transition-all duration-300 ${activePersona.opted.option === 'newsletter' ? 'border-primary bg-primary/10 shadow-lg' : 'opacity-60 border-border bg-card'}`}>
                  <h4 className="font-display text-lg mb-1">Newsletter</h4>
                  <p className="text-2xl font-bold text-primary">$2</p>
                </div>
                <div className={`p-4 rounded-lg border-2 w-36 text-center transition-all duration-300 ${activePersona.opted.option === 'ebook' ? 'border-primary bg-primary/10 shadow-lg' : 'opacity-60 border-border bg-card'}`}>
                  <h4 className="font-display text-lg mb-1">Instant eBook</h4>
                  <p className="text-2xl font-bold text-primary">$3</p>
                </div>
              </div>
              <p className="text-base md:text-lg text-foreground/80 leading-snug text-center md:text-left">
                {activePersona.opted.text}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HowItWorks;