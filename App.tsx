
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AwarenessModule from './components/AwarenessModule';
import DetectionModule from './components/DetectionModule';
import LegalModule from './components/LegalModule';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { UserProgress } from './types';
import { AWARENESS_TOPICS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('userProgress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, lastAccessed: new Date(parsed.lastAccessed) };
    }
    return { completedTopicIds: [], lastAccessed: new Date() };
  });

  // Persist theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Persist progress
  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(progress));
  }, [progress]);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toggleTopicCompletion = (topicId: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedTopicIds.includes(topicId);
      const newIds = isCompleted 
        ? prev.completedTopicIds.filter(id => id !== topicId)
        : [...prev.completedTopicIds, topicId];
      
      return {
        ...prev,
        completedTopicIds: newIds,
        lastAccessed: new Date()
      };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'hero':
        return (
          <>
            <Hero 
              onStartLearning={() => setActiveTab('awareness')} 
              onScanNow={() => setActiveTab('detection')}
              completedCount={progress.completedTopicIds.length}
              totalCount={AWARENESS_TOPICS.length}
            />
            <div className="border-t border-slate-200 dark:border-slate-900/50">
              <AwarenessModule 
                completedTopicIds={progress.completedTopicIds}
                onToggleCompletion={toggleTopicCompletion}
              />
            </div>
            <div className="border-t border-slate-200 dark:border-slate-900/50">
              <DetectionModule />
            </div>
          </>
        );
      case 'awareness':
        return (
          <div className="pt-20">
            <AwarenessModule 
              completedTopicIds={progress.completedTopicIds}
              onToggleCompletion={toggleTopicCompletion}
            />
          </div>
        );
      case 'detection':
        return <div className="pt-20"><DetectionModule /></div>;
      case 'legal':
        return <div className="pt-20"><LegalModule /></div>;
      default:
        return <Hero 
          onStartLearning={() => setActiveTab('awareness')} 
          onScanNow={() => setActiveTab('detection')} 
          completedCount={progress.completedTopicIds.length}
          totalCount={AWARENESS_TOPICS.length}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
      
      <main className="relative">
        {renderContent()}
      </main>

      <Footer />
      
      <Chatbot />
      
      {activeTab === 'hero' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500 animate-bounce pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-widest">Scroll to explore</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default App;
