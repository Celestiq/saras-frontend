// // frontend/components/landing/HeroSection.tsx
// 'use client';
// import { motion } from 'framer-motion';
// import { useRouter } from 'next/navigation'; // Import the router hook
// import { Button } from '@/components/ui/button';

// export default function HeroSection() {
//   const router = useRouter();

//   const handleJourneyClick = () => {
//     const token = localStorage.getItem('authToken');

//     if (token) {
//       router.push('/create');
//     } else {
//       router.push('/auth/login');
//     }
//   };

//   return (
//     <section className="min-h-screen w-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-background to-indigo-50">
//       <motion.h1
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//         className="font-display text-5xl md:text-7xl font-bold tracking-tight text-primary-text"
//       >
//         Turn any topic into a
//         <br /> 28-day learning journey
//       </motion.h1>
//       <motion.p
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.2 }}
//         className="mt-4 text-lg md:text-xl text-primary-text/80 max-w-2xl"
//       >
//         Saras crafts a personalized AI-powered book for you, delivered daily as bite-sized chapters to your inbox. <br /><br />Learn smarter, not harder.
//       </motion.p>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, delay: 0.4 }}
//         className="mt-8"
//       >
//         <Button 
//           onClick={handleJourneyClick} 
//           size="lg" 
//           className="bg-primary hover:bg-accent-hover text-white px-8 py-6 text-lg"
//         >
//           Start Your Journey
//         </Button>
//       </motion.div>
//     </section>
//   );
// }

// frontend/components/landing/HeroSection.tsx
'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const router = useRouter();

  const handleJourneyClick = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/create');
    } else {
      router.push('/auth/login');
    }
  };

  const headlineContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const headlineWordVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 10,
      } as const,
    },
  };

  const textFadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.17, 0.55, 0.55, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center items-center text-center p-4 overflow-hidden bg-gradient-to-br from-background to-indigo-50">
      {/* Dynamic Background Elements */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </motion.div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          variants={headlineContainerVariants}
          initial="hidden"
          animate="visible"
          className="font-display text-5xl md:text-7xl font-extrabold tracking-tight text-primary-text drop-shadow-sm leading-tight"
        >
          {"Turn any topic into a".split(" ").map((word, i) => (
            <motion.span variants={headlineWordVariants} className="inline-block mr-2" key={word + i}>
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span
            variants={headlineWordVariants}
            className="inline-block text-transparent bg-clip-text animate-text-gradient bg-gradient-to-r from-amber-600 via-orange-500 to-red-500"
            style={{ backgroundSize: '200% auto', WebkitBackgroundClip: 'text' }}
          >
            28-day learning journey
          </motion.span>
        </motion.h1>

        <motion.p
          variants={textFadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...textFadeInVariants.visible.transition, delay: 1.5 }}
          className="mt-8 text-lg md:text-xl text-primary-text/85 max-w-2xl mx-auto leading-relaxed"
        >
          Saras crafts a personalized AI-powered book for you, delivered daily as
          bite-sized chapters to your inbox.
        </motion.p>

        <motion.p
          variants={textFadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...textFadeInVariants.visible.transition, delay: 1.8 }}
          className="mt-6 text-xl md:text-2xl text-primary-text font-extrabold tracking-wide drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900"
        >
          Learn smarter, not harder.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-12" // Removed 'relative group'
        >
          <Button
            onClick={handleJourneyClick}
            size="lg"
            className="bg-primary hover:bg-accent-hover text-white px-10 py-7 text-xl rounded-full font-bold
                       
                       transform hover:-translate-y-1
                       transition-all duration-300 ease-out" // Simplified glow and transitions
          >
            Start Your Journey
          </Button>
        </motion.div>
      </div>
    </section>
  );
}