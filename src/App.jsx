import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EmotionalStatement from './components/EmotionalStatement';
import ForSeniors from './components/ForSeniors';
import ForCaregivers from './components/ForCaregivers';
import Impact from './components/Impact';
import Footer from './components/Footer';
import MemoryMatchGame from './components/MemoryMatchGame';
import SequenceRecallGame from './components/SequenceRecallGame';
import ObjectRecognitionGame from './components/ObjectRecognitionGame';
import WhichOneChangedGame from './components/WhichOneChangedGame';
import GardenGameChooser from './components/GardenGameChooser';
import PersonalMemoryGame from './components/PersonalMemoryGame';
import CaregiverDashboard from './components/CaregiverDashboard';
import SathiCompanion from './components/Sathi/SathiCompanion';
import butterflyVideo from '../video asset/Butterflies_flying_through_frame_20260915051045.mp4';

export default function App() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isSequenceGameOpen, setIsSequenceGameOpen] = useState(false);
  const [isRecognitionGameOpen, setIsRecognitionGameOpen] = useState(false);
  const [isWhichChangedOpen, setIsWhichChangedOpen] = useState(false);
  const [isGameChooserOpen, setIsGameChooserOpen] = useState(false);
  const [personalMemoryCapsule, setPersonalMemoryCapsule] = useState(null);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [isCaregiverDashboardOpen, setIsCaregiverDashboardOpen] = useState(false);

  const openGame = () => {
    setIsGamePaused(false);
    setIsGameOpen(true);
  };

  const closeGame = () => {
    setIsGamePaused(false);
    setIsGameOpen(false);
  };

  const openSequenceGame = () => setIsSequenceGameOpen(true);
  const closeSequenceGame = () => setIsSequenceGameOpen(false);
  const openRecognitionGame = () => setIsRecognitionGameOpen(true);
  const closeRecognitionGame = () => setIsRecognitionGameOpen(false);
  const openWhichChanged = () => setIsWhichChangedOpen(true);
  const closeWhichChanged = () => setIsWhichChangedOpen(false);

  const openGameChooser = () => setIsGameChooserOpen(true);
  const closeGameChooser = () => setIsGameChooserOpen(false);
  const openPersonalizedGame = (capsule) => setPersonalMemoryCapsule(capsule);
  const closePersonalizedGame = () => setPersonalMemoryCapsule(null);

  const chooseGame = (game) => {
    closeGameChooser();
    if (game === 'sequence') {
      openSequenceGame();
    } else if (game === 'recognition') {
      openRecognitionGame();
    } else if (game === 'whichchanged') {
      openWhichChanged();
    } else {
      openGame();
    }
  };

  return (
    <div className="relative min-h-screen bg-cream text-charcoal selection:bg-terracotta/20 selection:text-terracotta">
      <video
        className="butterfly-background"
        src={butterflyVideo}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div className="site-content relative z-10">
        <Navbar onOpenGame={openGameChooser} />
        <Hero onOpenGame={openGameChooser} />
        <EmotionalStatement />
        <ForSeniors onOpenGame={openGame} onOpenSequenceGame={openSequenceGame} />
        <ForCaregivers
          onOpenPersonalizedGame={openPersonalizedGame}
          onOpenDashboard={() => setIsCaregiverDashboardOpen(true)}
        />
        <Impact />
        <Footer />
      </div>

      {/* Global Sathi companion — voice → intent → tools → store */}
      <SathiCompanion
        onOpenGame={openGame}
        onOpenDashboard={() => setIsCaregiverDashboardOpen(true)}
        isGameOpen={isGameOpen}
        onPauseGame={() => setIsGamePaused(true)}
        onResumeGame={() => setIsGamePaused(false)}
      />

      <AnimatePresence>
        {isCaregiverDashboardOpen && (
          <CaregiverDashboard onClose={() => setIsCaregiverDashboardOpen(false)} />
        )}
      </AnimatePresence>

      <GardenGameChooser
        isOpen={isGameChooserOpen}
        onClose={closeGameChooser}
        onChoose={chooseGame}
      />

      <AnimatePresence>
        {personalMemoryCapsule && (
          <div className="fixed inset-0 z-[70] bg-charcoal overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="min-h-screen w-full"
            >
              <PersonalMemoryGame
                capsule={personalMemoryCapsule}
                onClose={closePersonalizedGame}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isGameOpen && (
          <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-charcoal/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full min-h-screen overflow-y-auto"
            >
              <MemoryMatchGame
                onClose={closeGame}
                isPaused={isGamePaused}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSequenceGameOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal/75 p-3 backdrop-blur-md sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="my-auto w-full max-w-3xl rounded-[24px]"
            >
              <SequenceRecallGame onClose={closeSequenceGame} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecognitionGameOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal/75 p-3 backdrop-blur-md sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="my-auto w-full max-w-3xl rounded-[24px]"
            >
              <ObjectRecognitionGame onClose={closeRecognitionGame} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWhichChangedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-charcoal/75 p-3 backdrop-blur-md sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="my-auto w-full max-w-3xl rounded-[24px]"
            >
              <WhichOneChangedGame onClose={closeWhichChanged} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
