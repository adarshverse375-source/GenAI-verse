import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  HelpCircle, 
  Lightbulb, 
  GraduationCap, 
  Flame, 
  Trophy, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Moon, 
  Sun, 
  Check, 
  Award, 
  FileText,
  BadgeAlert,
  Plus,
  PlusCircle,
  FolderKanban,
  Star
} from 'lucide-react';
import { ThemeType, SubjectType, Question, CustomQuestion, Flashcard, Chapter, UserProgress, BADGES, Badge } from './types';
import { CBSE_CHAPTERS } from './data';
import { AddQuestionModal } from './components/AddQuestionModal';
import { ManageQuestionsModal } from './components/ManageQuestionsModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // --- Persistent State ---
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('cbse_brights_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure standard initial properties exist
        if (typeof parsed.points === 'number') return parsed;
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
    }
    return {
      theme: 'learning',
      points: 120, // Pre-seeded starting point so badges are visible
      streak: 5,
      lastActiveDate: new Date().toLocaleDateString(),
      quizScores: {},
      quizAttempts: {},
      completedFlashcards: [],
      unlockedBadges: ['novice']
    };
  });

  // Keep theme in sync with state
  const activeTheme = userProgress.theme;

  // Save progress automatically
  useEffect(() => {
    localStorage.setItem('cbse_brights_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // --- UI Navigation State ---
  const [activeTab, setActiveTab] = useState<'study' | 'quiz' | 'ai' | 'badges'>('study');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Mathematics');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('math-real-numbers');

  // Find active chapter based on subject/id
  const filteredChapters = CBSE_CHAPTERS.filter(c => c.subject === selectedSubject);
  const activeChapter = CBSE_CHAPTERS.find(c => c.id === selectedChapterId) || CBSE_CHAPTERS[0];

  // If selected chapter doesn't belong to current subject, auto-select first of that subject
  useEffect(() => {
    if (activeChapter.subject !== selectedSubject && filteredChapters.length > 0) {
      setSelectedChapterId(filteredChapters[0].id);
    }
  }, [selectedSubject, activeChapter, filteredChapters]);

  // --- Flashcards State ---
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Reset card state when chapter changes
  useEffect(() => {
    setCurrentCardIdx(0);
    setIsCardFlipped(false);
  }, [selectedChapterId]);

  // --- Custom User Questions State ---
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('cbse_brights_custom_questions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse custom questions', e);
      return [];
    }
  });

  // Save custom questions automatically
  useEffect(() => {
    localStorage.setItem('cbse_brights_custom_questions', JSON.stringify(customQuestions));
  }, [customQuestions]);

  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isManageQuestionsModalOpen, setIsManageQuestionsModalOpen] = useState(false);

  // Helper to get combined questions (handpicked high-yield + user-created)
  const getChapterQuestions = (chapId: string) => {
    const chap = CBSE_CHAPTERS.find(c => c.id === chapId) || CBSE_CHAPTERS[0];
    const userAdded = customQuestions.filter(q => q.chapterId === chapId);
    return [...chap.highYieldQuestions, ...userAdded];
  };

  // --- Quiz Practice State ---
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => getChapterQuestions(selectedChapterId));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // AI MCQ Generator state
  const [aiQuizLoading, setAiQuizLoading] = useState(false);
  const [aiQuizError, setAiQuizError] = useState<string | null>(null);
  const [customQuizGenerated, setCustomQuizGenerated] = useState(false);

  // Sync questions when chapter or custom questions change (unless a custom AI quiz is active)
  useEffect(() => {
    if (!customQuizGenerated) {
      setActiveQuestions(getChapterQuestions(selectedChapterId));
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setQuizScore(0);
      setQuizFinished(false);
      setAiQuizError(null);
    }
  }, [selectedChapterId, activeChapter, customQuestions, customQuizGenerated]);

  // --- AI Chat Study Companion State ---
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { 
      sender: 'ai', 
      text: "👋 Hello! I'm your Brights AI CBSE Class 10 study partner. Ask me anything! I can break down tough math equations, write out chemical equations, explain historical movements, or share critical Board Exam tips." 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // --- Feedback Toast State ---
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- Score Reward Handler ---
  const addPoints = (amount: number, reason: string) => {
    setUserProgress(prev => {
      const newPoints = prev.points + amount;
      let newlyUnlocked: string[] = [...prev.unlockedBadges];
      
      // Check for new badge unlocks
      BADGES.forEach(badge => {
        if (newPoints >= badge.unlockedAtPoints && !newlyUnlocked.includes(badge.id)) {
          newlyUnlocked.push(badge.id);
          setTimeout(() => {
            showToast(`🏆 Achievement Unlocked: ${badge.title}!`, 'success');
          }, 500);
        }
      });

      return {
        ...prev,
        points: newPoints,
        unlockedBadges: newlyUnlocked
      };
    });
    showToast(`+${amount} Points: ${reason}!`, 'success');
  };

  // --- Theme Toggle Handler ---
  const toggleTheme = () => {
    const nextTheme: ThemeType = activeTheme === 'learning' ? 'midnight' : 'learning';
    setUserProgress(prev => ({ ...prev, theme: nextTheme }));
    showToast(`Switched to ${nextTheme === 'learning' ? 'Learning Brights (Tactile)' : 'Midnight Brights (Glassmorphic)'} theme!`, 'info');
  };

  // --- Custom Questions Handlers ---
  const handleSaveCustomQuestion = (newQuestion: CustomQuestion) => {
    setCustomQuestions(prev => [newQuestion, ...prev]);
    addPoints(25, 'Contributed Custom Question');
    showToast('Question saved to Board MCQ pool! +25 XP', 'success');
  };

  const handleDeleteCustomQuestion = (questionId: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== questionId));
    showToast('Question removed from quiz pool', 'info');
  };

  // --- API Call: Chat with CBSE 10 Tutor ---
  const handleSendChatMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const newUserMessage = { sender: 'user' as const, text: textToSend };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      // Build brief chat history format
      const formattedHistory = chatMessages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: formattedHistory })
      });

      if (!res.ok) {
        throw new Error('Tutor server didn\'t respond correctly. Please check your internet connection or API keys.');
      }

      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.text }]);
      addPoints(5, 'Chatted with AI Tutor');
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'Unable to connect to Gemini API. Please make sure GEMINI_API_KEY is configured.');
      showToast('Tutor session failed', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  // --- API Call: Generate Custom AI Quiz Questions ---
  const generateAIQuiz = async () => {
    if (aiQuizLoading) return;
    setAiQuizLoading(true);
    setAiQuizError(null);
    showToast('Consulting Board Paper setter...', 'info');

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: activeChapter.name,
          count: 4
        })
      });

      if (!res.ok) {
        throw new Error('Board generation server error. Verify your server is online.');
      }

      const data = await res.json();
      if (data && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setActiveQuestions(data.questions);
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setQuizScore(0);
        setQuizFinished(false);
        setCustomQuizGenerated(true);
        showToast('Successfully generated fresh CBSE Board MCQs!', 'success');
        addPoints(15, 'Generated Custom AI Quiz');
      } else {
        throw new Error('Invalid quiz response structure received.');
      }
    } catch (err: any) {
      console.error(err);
      setAiQuizError(err.message || 'Failed to generate custom board exam MCQs. Using offline preloaded syllabus questions.');
      showToast('Using preloaded questions', 'error');
    } finally {
      setAiQuizLoading(false);
    }
  };

  // --- Quiz Actions ---
  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    
    const correct = selectedOption === activeQuestions[currentQuestionIdx].correctIndex;
    if (correct) {
      setQuizScore(prev => prev + 1);
      addPoints(10, `Correct Answer to Q${currentQuestionIdx + 1}`);
      showToast('Fabulous! Correct answer.', 'success');
    } else {
      showToast('Ah, incorrect! Review the explanation.', 'error');
    }
  };

  const handleQuizNext = () => {
    if (currentQuestionIdx < activeQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
      
      // Calculate and save highscore
      const finalPercentage = Math.round((quizScore / activeQuestions.length) * 100);
      setUserProgress(prev => {
        const currentHigh = prev.quizScores[activeChapter.id] || 0;
        const attempts = (prev.quizAttempts[activeChapter.id] || 0) + 1;
        
        return {
          ...prev,
          quizScores: {
            ...prev.quizScores,
            [activeChapter.id]: Math.max(currentHigh, finalPercentage)
          },
          quizAttempts: {
            ...prev.quizAttempts,
            [activeChapter.id]: attempts
          }
        };
      });

      // Bonus points on completion
      if (finalPercentage === 100) {
        addPoints(50, 'Perfect Score 100% on Board MCQ Mock Exam');
      } else if (finalPercentage >= 70) {
        addPoints(25, 'Finished Board MCQ Mock Exam (Passed)');
      } else {
        addPoints(10, 'Completed Board MCQ Mock Exam');
      }
    }
  };

  const handleQuizRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  // --- Flashcard Actions ---
  const handleFlashcardComplete = (cardId: string) => {
    if (userProgress.completedFlashcards.includes(cardId)) {
      showToast('Flashcard already learned!', 'info');
      return;
    }
    
    setUserProgress(prev => ({
      ...prev,
      completedFlashcards: [...prev.completedFlashcards, cardId]
    }));
    addPoints(15, 'Learned Study Flashcard');
  };

  // --- Dynamic Style Helpers depending on selected Theme ---
  const isMidnight = activeTheme === 'midnight';
  
  const getSubjectColor = (subj: SubjectType) => {
    switch (subj) {
      case 'Mathematics':
        return isMidnight ? '#38bdf8' : '#0058be'; // Sky Blue vs Electric Blue
      case 'Science':
        return isMidnight ? '#ec4899' : '#dc2c4f'; // Pink vs Berry Pink
      case 'Social Science':
        return isMidnight ? '#f97316' : '#fdd404'; // Orange vs Sunshine Yellow
      case 'English Literature':
        return isMidnight ? '#10b981' : '#10b981'; // Mint Green vs Mint Green
    }
  };

  const subjectThemeBg = getSubjectColor(selectedSubject);

  return (
    <div 
      id="app-root-container"
      className={`min-h-screen w-full transition-colors duration-300 ${
        isMidnight 
          ? 'bg-[#0f172a] text-[#e6e0e9] font-vietnam selection:bg-[#38bdf8]/30 selection:text-white' 
          : 'bg-[#f8fafc] text-[#191c1e] font-quicksand selection:bg-[#0058be]/20'
      }`}
    >
      
      {/* BACKGROUND GRAPHICS (Squircles for Learning, Neon Gradients for Midnight) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {isMidnight ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 blur-[120px]" />
            <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[5%] left-[2%] w-48 h-48 rounded-[3rem] bg-sky-200/40 rotate-12 blur-2xl" />
            <div className="absolute bottom-[10%] right-[5%] w-72 h-72 rounded-[4rem] bg-amber-100/50 -rotate-12 blur-3xl" />
            <div className="absolute top-[50%] left-[80%] w-64 h-64 rounded-full bg-pink-100/40 blur-2xl" />
          </>
        )}
      </div>

      {/* --- FEEDBACK TOASTS --- */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            id="app-toast-alert"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-full shadow-lg max-w-md w-[90%]"
            style={{
              background: isMidnight ? 'rgba(30, 41, 59, 0.9)' : '#ffffff',
              border: `2px solid ${
                toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#f43f5e' : '#38bdf8'
              }`,
              boxShadow: isMidnight 
                ? '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(56,189,248,0.1)' 
                : '4px 4px 0px 0px rgba(0,0,0,0.05)',
            }}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-sky-500 shrink-0" />}
            <span className={`text-sm font-semibold ${isMidnight ? 'text-white' : 'text-slate-800'}`}>
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
        
        {/* ======================================================= */}
        {/* HEADER SECTION                                          */}
        {/* ======================================================= */}
        <header 
          id="app-header"
          className={`flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 ${
            isMidnight 
              ? 'glass-panel rounded-2xl p-5' 
              : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-5'
          }`}
        >
          {/* Brand Logo & Info */}
          <div className="flex items-center gap-3.5">
            <div 
              id="app-brand-logo"
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all select-none ${
                isMidnight 
                  ? 'glass-panel shadow-[0_0_20px_rgba(56,189,248,0.35)] border border-white/20' 
                  : 'shadow-[0_4px_0_0_rgba(0,0,0,0.12)] border-2 border-white/40 active:translate-y-[2px]'
              }`}
              style={{ background: `linear-gradient(135deg, ${subjectThemeBg}, #8b5cf6)` }}
            >
              <Sparkles className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${isMidnight ? 'font-jakarta text-white' : 'font-quicksand text-slate-900'}`}>
                BRIGHTS <span className="gradient-text-clip font-black">Class 10</span>
              </h1>
              <p className="text-xs opacity-75 font-medium flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Syllabus Chapter Study & Board Exam Prep
              </p>
            </div>
          </div>

          {/* User Score Metrics & Streak Bar */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5">
            
            {/* Points Badge */}
            <div 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isMidnight ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold opacity-70 block leading-none">Total Score</span>
                <span className="font-extrabold text-sm">{userProgress.points} XP</span>
              </div>
            </div>

            {/* Daily Streak */}
            <div 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isMidnight ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold opacity-70 block leading-none">Day Streak</span>
                <span className="font-extrabold text-sm">{userProgress.streak} Days</span>
              </div>
            </div>

            {/* PWA Install Button for Android / Mobile */}
            <PWAInstallButton isMidnight={isMidnight} />

            {/* High-Fidelity Theme Selector Slider */}
            <button 
              id="theme-toggle-slider"
              onClick={toggleTheme}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
                isMidnight 
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 hover:bg-slate-700' 
                  : 'bg-slate-100 text-[#0058be] border-2 border-[#0058be]/20 hover:bg-slate-200'
              }`}
            >
              {isMidnight ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Midnight Brights</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Learning Brights</span>
                </>
              )}
              <span className="absolute -top-1.5 -right-1 px-1 bg-red-500 text-[8px] text-white rounded-full">Dual</span>
            </button>
          </div>
        </header>

        {/* ======================================================= */}
        {/* SUBJECT SELECTION BAR                                    */}
        {/* ======================================================= */}
        <section id="subject-selector" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['Mathematics', 'Science', 'Social Science', 'English Literature'] as SubjectType[]).map((subj) => {
            const isSelected = selectedSubject === subj;
            const itemColor = getSubjectColor(subj);
            
            return (
              <button
                key={subj}
                id={`subject-btn-${subj.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedSubject(subj)}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden ${
                  isMidnight
                    ? isSelected 
                      ? 'bg-slate-800 border-2 text-white'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    : isSelected
                      ? 'bg-white border-2 text-slate-900'
                      : 'bg-[#f1f5f9] border border-slate-200 text-slate-600 hover:bg-slate-200/50'
                }`}
                style={{
                  borderColor: isSelected ? itemColor : undefined,
                  boxShadow: isSelected
                    ? isMidnight 
                      ? `0 0 16px -4px ${itemColor}40`
                      : `4px 4px 0px 0px ${itemColor}30`
                    : undefined
                }}
              >
                {/* Decorative glow corner on selected subject */}
                {isSelected && (
                  <div 
                    className="absolute -top-6 -right-6 w-12 h-12 rounded-full opacity-20 blur-md"
                    style={{ backgroundColor: itemColor }}
                  />
                )}
                
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">Class 10 CBSE</span>
                <span className={`text-base font-extrabold ${isMidnight ? 'font-jakarta' : 'font-quicksand'}`}>
                  {subj}
                </span>

                {/* Micro Subject progress dots */}
                <div className="flex gap-1 mt-2.5">
                  <div className="w-2.5 h-1.5 rounded-full" style={{ backgroundColor: itemColor }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 opacity-50" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 opacity-50" />
                </div>
              </button>
            );
          })}
        </section>

        {/* ======================================================= */}
        {/* TWO COLUMN WORKSPACE                                   */}
        {/* ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE PANEL (4 cols): Chapter Lists & Navigator */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            <div 
              className={`${
                isMidnight 
                  ? 'glass-panel rounded-2xl p-5' 
                  : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-5'
              }`}
            >
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200/50">
                <h3 className={`text-base font-bold flex items-center gap-2 ${isMidnight ? 'text-white' : 'text-slate-800'}`}>
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  Syllabus Chapters
                </h3>
                <span className="text-xs font-bold opacity-70 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  {filteredChapters.length} Chapters
                </span>
              </div>

              {/* List of Chapters for the selected subject */}
              <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                {filteredChapters.length === 0 ? (
                  <p className="text-sm opacity-60 italic text-center py-6">No chapters curated yet. Ask AI tutor to explain other topics!</p>
                ) : (
                  filteredChapters.map((ch) => {
                    const isChSelected = selectedChapterId === ch.id;
                    const completionRate = userProgress.quizScores[ch.id] || 0;
                    
                    return (
                      <button
                        key={ch.id}
                        id={`chapter-item-${ch.id}`}
                        onClick={() => setSelectedChapterId(ch.id)}
                        className={`w-full p-3.5 rounded-xl text-left transition-all flex justify-between items-center ${
                          isChSelected
                            ? isMidnight 
                              ? 'bg-slate-800/80 border border-sky-400/40 text-white shadow-inner' 
                              : 'bg-[#f0f9ff] border-2 border-[#0058be] text-[#0058be]'
                            : isMidnight
                              ? 'bg-slate-900/40 border border-slate-800/60 text-slate-300 hover:bg-slate-800/30'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                        style={{
                          boxShadow: !isChSelected && !isMidnight ? '2px 2px 0px 0px rgba(0,0,0,0.02)' : undefined
                        }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold uppercase opacity-60">CHAPTER</span>
                          <span className={`text-sm font-bold ${isMidnight ? 'font-jakarta' : 'font-quicksand'}`}>
                            {ch.name}
                          </span>
                        </div>
                        
                        {/* Micro score indicator */}
                        {completionRate > 0 ? (
                          <span 
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              completionRate >= 90 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            Score: {completionRate}%
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-40 italic">Unattempted</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* AI Prompts Helper Box */}
            <div 
              className={`p-5 rounded-2xl relative overflow-hidden ${
                isMidnight 
                  ? 'glass-panel-heavy' 
                  : 'bg-sky-50 border-2 border-sky-200 shadow-[4px_4px_0px_0px_rgba(224,242,254,1)] text-sky-950'
              }`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-15">
                <Sparkles className="w-12 h-12 text-sky-400" />
              </div>
              <h4 className="text-sm font-extrabold flex items-center gap-1.5 mb-2 text-sky-500">
                <Sparkles className="w-4 h-4" />
                AI Board Assistant
              </h4>
              <p className="text-xs opacity-85 leading-relaxed mb-4">
                Have specific Board questions? Switch to the AI Study Companion tab or click any quick-study prompt below!
              </p>
              
              {/* Quick AI Prompts */}
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    setActiveTab('ai');
                    handleSendChatMessage(`Explain CBSE Class 10 ${selectedSubject}: "${activeChapter.name}" formulas & high-yield board tips.`);
                  }}
                  className={`text-xs text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isMidnight 
                      ? 'bg-slate-900/70 border-slate-700 hover:bg-slate-800 hover:text-white' 
                      : 'bg-white border-sky-200 hover:bg-sky-100 text-slate-700 hover:text-sky-950'
                  }`}
                >
                  <span>📝 Formulas & High-yield tips</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('ai');
                    handleSendChatMessage(`Solve a typical Board Exam problem from Chapter: "${activeChapter.name}".`);
                  }}
                  className={`text-xs text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    isMidnight 
                      ? 'bg-slate-900/70 border-slate-700 hover:bg-slate-800 hover:text-white' 
                      : 'bg-white border-sky-200 hover:bg-sky-100 text-slate-700 hover:text-sky-950'
                  }`}
                >
                  <span>🧮 Solve board exam question</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN WORKSPACE (8 cols): Tabs, Flashcards, Quiz & Chat */}
          <main className="lg:col-span-8 flex flex-col gap-5">
            
            {/* TAB SELECTOR CHIPS */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-0.5 justify-start gap-4">
              {[
                { id: 'study', label: '📚 Study Notes', count: activeChapter.keySummary.length },
                { id: 'quiz', label: '📝 Board Quizzes', count: activeQuestions.length },
                { id: 'ai', label: '🤖 AI Tutor Companion', count: null },
                { id: 'badges', label: '🏆 Badges & Metrics', count: userProgress.unlockedBadges.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-button-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3.5 text-sm font-bold border-b-2 transition-all relative ${
                      isActive 
                        ? isMidnight 
                          ? 'border-sky-400 text-white' 
                          : 'border-[#0058be] text-[#0058be]'
                        : isMidnight
                          ? 'border-transparent text-slate-400 hover:text-slate-200'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab.label}
                      {tab.count !== null && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive 
                            ? isMidnight ? 'bg-sky-950 text-sky-400' : 'bg-blue-100 text-[#0058be]'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </span>
                    
                    {/* Animated bar indicator under active tab */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ backgroundColor: isMidnight ? '#38bdf8' : '#0058be' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* TAB PANEL CONTENTS */}
            <AnimatePresence mode="wait">
              
              {/* ======================================================= */}
              {/* TAB 1: STUDY NOTES & FLASHCARDS                         */}
              {/* ======================================================= */}
              {activeTab === 'study' && (
                <motion.div
                  key="tab-study"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  
                  {/* Summary Notes Card */}
                  <section 
                    className={`${
                      isMidnight 
                        ? 'glass-panel rounded-2xl p-6' 
                        : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-6'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b pb-4 border-slate-200/50">
                      <div>
                        <span 
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                          style={{
                            backgroundColor: `${subjectThemeBg}15`,
                            color: subjectThemeBg
                          }}
                        >
                          {activeChapter.subject}
                        </span>
                        <h2 className={`text-xl font-extrabold mt-1.5 ${isMidnight ? 'font-jakarta text-white' : 'font-quicksand text-slate-900'}`}>
                          {activeChapter.name} Notes
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveTab('quiz')}
                          className={`text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 ${
                            isMidnight 
                              ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          Take MCQ Practice
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Key takeaways bullet list */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">📝 Key Syllabus Takeaways</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeChapter.keySummary.map((bullet, idx) => (
                          <li 
                            key={idx}
                            className={`p-4 rounded-xl border flex gap-3 ${
                              isMidnight 
                                ? 'bg-slate-900/30 border-slate-800 text-slate-300' 
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span 
                              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                              style={{ backgroundColor: subjectThemeBg }}
                            >
                              {idx + 1}
                            </span>
                            <span className="text-xs leading-relaxed font-medium">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick reference formulas sheet */}
                    <div className="mt-6 p-4 rounded-xl bg-violet-600/5 border border-violet-500/20">
                      <h4 className="text-xs font-bold uppercase text-violet-500 flex items-center gap-1.5 mb-3">
                        <Lightbulb className="w-4 h-4" />
                        Board Quick Reference & Formulas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {activeChapter.formulasOrFacts.map((fact, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-lg text-xs font-semibold ${
                              isMidnight ? 'bg-slate-900/60 text-[#cbc4d2]' : 'bg-white text-slate-800 shadow-sm border border-slate-200'
                            }`}
                          >
                            {fact}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* HIGH-FIDELITY STUDY FLASHCARDS WIDGET */}
                  <section 
                    className={`${
                      isMidnight 
                        ? 'glass-panel rounded-2xl p-6' 
                        : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-6'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className={`text-base font-extrabold ${isMidnight ? 'text-white' : 'text-slate-800'}`}>
                          🧠 Active-Recall Study Flashcards
                        </h3>
                        <p className="text-xs opacity-75 mt-0.5">Flip cards to test memory. Mark as Learned to gain +15 XP!</p>
                      </div>
                      <span className="text-xs font-bold py-1 px-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        Card {currentCardIdx + 1} of {activeChapter.flashcards.length}
                      </span>
                    </div>

                    {/* Active Flashcard Canvas */}
                    {activeChapter.flashcards.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        
                        {/* CARD BOX with 3D Flip */}
                        <div 
                          onClick={() => setIsCardFlipped(prev => !prev)}
                          className="h-[180px] w-full cursor-pointer relative transition-all duration-500"
                          style={{ perspective: '1000px' }}
                        >
                          <div 
                            className="absolute inset-0 w-full h-full transition-all duration-500 rounded-2xl p-6 flex flex-col justify-between"
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                              backgroundColor: isMidnight 
                                ? isCardFlipped ? '#211f24' : 'rgba(30,41,59,0.9)' 
                                : isCardFlipped ? '#fff8e1' : '#ffffff',
                              border: `2px solid ${isCardFlipped ? '#fdd404' : subjectThemeBg}`,
                              boxShadow: isMidnight 
                                ? '0 8px 30px rgba(0,0,0,0.4)' 
                                : isCardFlipped 
                                  ? '4px 4px 0px 0px rgba(253,212,4,0.3)' 
                                  : `4px 4px 0px 0px ${subjectThemeBg}20`
                            }}
                          >
                            {/* Card Content based on rotation */}
                            {!isCardFlipped ? (
                              /* FRONT SIDE */
                              <div className="flex flex-col justify-between h-full" style={{ backfaceVisibility: 'hidden' }}>
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">BOARD QUESTION</span>
                                <p className={`text-sm md:text-base font-bold text-center self-center max-w-lg ${
                                  isMidnight ? 'text-[#e6e0e9]' : 'text-slate-900'
                                }`}>
                                  {activeChapter.flashcards[currentCardIdx].front}
                                </p>
                                <span className="text-[10px] italic text-center text-slate-400 block mt-2">Click card to reveal answer</span>
                              </div>
                            ) : (
                              /* BACK SIDE (Rotated 180deg) */
                              <div 
                                className="flex flex-col justify-between h-full text-center" 
                                style={{ 
                                  backfaceVisibility: 'hidden',
                                  transform: 'rotateY(180deg)'
                                }}
                              >
                                <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider text-amber-600 block">ANSWER SCHEME EXPLAINED</span>
                                <p className={`text-xs md:text-sm font-bold max-w-lg mx-auto ${
                                  isMidnight ? 'text-white' : 'text-slate-800'
                                }`}>
                                  {activeChapter.flashcards[currentCardIdx].back}
                                </p>
                                {activeChapter.flashcards[currentCardIdx].extraInfo && (
                                  <span className="text-[10px] text-violet-500 font-bold block bg-violet-500/10 py-1 px-2.5 rounded">
                                    💡 Tip: {activeChapter.flashcards[currentCardIdx].extraInfo}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Flashcard Slider Navigator Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-2">
                            <button
                              disabled={currentCardIdx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCardFlipped(false);
                                setTimeout(() => setCurrentCardIdx(prev => prev - 1), 150);
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                currentCardIdx === 0 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              disabled={currentCardIdx === activeChapter.flashcards.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCardFlipped(false);
                                setTimeout(() => setCurrentCardIdx(prev => prev + 1), 150);
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                currentCardIdx === activeChapter.flashcards.length - 1 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          {/* "Mark as learned" button */}
                          <button
                            id="btn-mark-learned-card"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlashcardComplete(activeChapter.flashcards[currentCardIdx].id);
                            }}
                            className={`text-xs font-extrabold flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all ${
                              userProgress.completedFlashcards.includes(activeChapter.flashcards[currentCardIdx].id)
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30'
                                : isMidnight
                                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {userProgress.completedFlashcards.includes(activeChapter.flashcards[currentCardIdx].id) ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-500" />
                                Learnt & Mastered
                              </>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 opacity-70" />
                                Mark as Learnt (+15 XP)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm opacity-60 text-center py-6">No study flashcards available for this section.</p>
                    )}
                  </section>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* TAB 2: PRACTICE BOARD QUIZ                              */}
              {/* ======================================================= */}
              {activeTab === 'quiz' && (
                <motion.div
                  key="tab-quiz"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <section 
                    className={`${
                      isMidnight 
                        ? 'glass-panel rounded-2xl p-6' 
                        : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-6'
                    }`}
                  >
                    
                    {/* Header with AI Custom MCQ Options & Add Question */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b pb-4 border-slate-200/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className={`text-xl font-extrabold ${isMidnight ? 'font-jakarta text-white' : 'font-quicksand text-slate-900'}`}>
                            Board MCQ Mock Quiz
                          </h2>
                          {customQuestions.filter(q => q.chapterId === activeChapter.id).length > 0 && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              {customQuestions.filter(q => q.chapterId === activeChapter.id).length} Custom Added
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-75 mt-0.5">
                          {customQuizGenerated 
                            ? '✨ Playing newly generated Custom AI Board Exam Questions.'
                            : `Reviewing high-yield ${activeChapter.subject} questions (${activeQuestions.length} in this chapter).`}
                        </p>
                      </div>

                      {/* Action Buttons: Add Question + My Questions + AI Generator */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Add Custom Question Button */}
                        <button
                          id="add-custom-question-btn"
                          onClick={() => setIsAddQuestionModalOpen(true)}
                          className={`text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                            isMidnight
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                              : 'bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 shadow-[2px_2px_0px_0px_rgba(245,158,11,0.5)]'
                          }`}
                          title="Add your own custom board question"
                        >
                          <PlusCircle className="w-4 h-4 text-amber-500" />
                          Add Question
                        </button>

                        {/* Manage Questions Button (if any exist) */}
                        {customQuestions.length > 0 && (
                          <button
                            id="manage-custom-questions-btn"
                            onClick={() => setIsManageQuestionsModalOpen(true)}
                            className={`text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                              isMidnight
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                            title="Manage questions you have added"
                          >
                            <FolderKanban className="w-4 h-4 text-indigo-500" />
                            My Questions ({customQuestions.length})
                          </button>
                        )}

                        {/* Full-Stack AI MCQ Generation Button */}
                        <button
                          id="ai-generate-quiz-btn"
                          disabled={aiQuizLoading}
                          onClick={generateAIQuiz}
                          className={`text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            isMidnight
                              ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:opacity-90 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                              : 'bg-[#dc2c4f] text-white border-b-4 border-[#92002a] hover:translate-y-[1px] hover:border-b-2 active:translate-y-[3px] active:border-b-0'
                          } ${aiQuizLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <Cpu className={`w-4 h-4 ${aiQuizLoading ? 'animate-spin' : ''}`} />
                          {aiQuizLoading ? 'Analyzing Curriculum...' : 'Generate New with AI'}
                        </button>
                      </div>
                    </div>

                    {/* API Generator Error Notice */}
                    {aiQuizError && (
                      <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{aiQuizError}</span>
                      </div>
                    )}

                    {/* --- MAIN QUIZ BODY --- */}
                    {!quizFinished ? (
                      activeQuestions.length > 0 ? (
                        <div className="flex flex-col gap-5">
                          
                          {/* Progress Line */}
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${((currentQuestionIdx + 1) / activeQuestions.length) * 100}%`,
                                backgroundColor: subjectThemeBg
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">
                                QUESTION {currentQuestionIdx + 1} OF {activeQuestions.length}
                              </span>
                              {(activeQuestions[currentQuestionIdx] as CustomQuestion).author && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-500" /> Added by You
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">
                              Class 10 Board Spec
                            </span>
                          </div>

                          {/* Question Text */}
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40">
                            <h3 className={`text-base md:text-lg font-bold leading-relaxed ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                              {activeQuestions[currentQuestionIdx].questionText}
                            </h3>
                          </div>

                          {/* Multiple Choice Options */}
                          <div className="flex flex-col gap-2.5">
                            {activeQuestions[currentQuestionIdx].options.map((option, idx) => {
                              const isSelected = selectedOption === idx;
                              const isCorrect = idx === activeQuestions[currentQuestionIdx].correctIndex;
                              
                              // Calculate dynamic background color for quiz options
                              let optionStyles = '';
                              if (isAnswerSubmitted) {
                                if (isCorrect) {
                                  optionStyles = isMidnight 
                                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                                    : 'bg-emerald-50 border-emerald-500 text-emerald-800';
                                } else if (isSelected) {
                                  optionStyles = isMidnight 
                                    ? 'bg-rose-500/15 border-rose-500 text-rose-400' 
                                    : 'bg-rose-50 border-rose-500 text-rose-800';
                                } else {
                                  optionStyles = isMidnight 
                                    ? 'bg-slate-900/30 border-slate-800 text-slate-500' 
                                    : 'bg-slate-50 border-slate-100 text-slate-400';
                                }
                              } else {
                                if (isSelected) {
                                  optionStyles = isMidnight 
                                    ? 'bg-sky-500/15 border-sky-400 text-sky-300' 
                                    : 'bg-sky-50 border-sky-500 text-sky-800';
                                } else {
                                  optionStyles = isMidnight 
                                    ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40 text-slate-300' 
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700';
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  id={`quiz-option-${idx}`}
                                  disabled={isAnswerSubmitted}
                                  onClick={() => handleOptionSelect(idx)}
                                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between text-xs md:text-sm font-semibold ${optionStyles}`}
                                  style={{
                                    boxShadow: !isMidnight && isSelected && !isAnswerSubmitted
                                      ? `2px 2px 0px 0px ${subjectThemeBg}30`
                                      : undefined
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <span 
                                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                        isSelected 
                                          ? 'bg-sky-500 text-white' 
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span>{option}</span>
                                  </div>
                                  
                                  {/* Right side check/cross icon */}
                                  {isAnswerSubmitted && isCorrect && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                  )}
                                  {isAnswerSubmitted && isSelected && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Submit & Navigation Footer */}
                          <div className="flex justify-between items-center border-t pt-4 border-slate-200/50 mt-2">
                            <div>
                              {!isAnswerSubmitted ? (
                                <span className="text-xs opacity-60">Pick an option to unlock submitting</span>
                              ) : (
                                <span className="text-xs text-violet-500 font-bold block bg-violet-500/10 py-1 px-2.5 rounded">
                                  +10 Points earned on correct answer!
                                </span>
                              )}
                            </div>
                            
                            {!isAnswerSubmitted ? (
                              <button
                                id="quiz-submit-btn"
                                disabled={selectedOption === null}
                                onClick={handleQuizSubmit}
                                className={`text-sm font-extrabold py-3 px-6 rounded-xl transition-all ${
                                  selectedOption === null 
                                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60' 
                                    : isMidnight
                                      ? 'bg-sky-400 hover:bg-sky-300 text-slate-900 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                                      : 'bg-[#0058be] hover:opacity-90 border-b-4 border-[#004395] text-white hover:translate-y-[1px] active:translate-y-[2px] active:border-b-0'
                                }`}
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                id="quiz-next-btn"
                                onClick={handleQuizNext}
                                className={`text-sm font-extrabold py-3 px-6 rounded-xl transition-all flex items-center gap-1.5 ${
                                  isMidnight
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                    : 'bg-emerald-600 hover:opacity-90 border-b-4 border-emerald-800 text-white hover:translate-y-[1px] active:translate-y-[2px] active:border-b-0'
                                }`}
                              >
                                {currentQuestionIdx === activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Explanation Accordion (Visible after submission) */}
                          {isAnswerSubmitted && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/30 border-indigo-500/20 text-xs md:text-sm mt-3"
                            >
                              <div className="flex gap-2 items-center mb-1.5 text-indigo-500 font-bold">
                                <Lightbulb className="w-4 h-4" />
                                <span>Board Marking Scheme Explanation</span>
                              </div>
                              <p className="opacity-90 leading-relaxed font-semibold">
                                {activeQuestions[currentQuestionIdx].explanation}
                              </p>
                            </motion.div>
                          )}

                        </div>
                      ) : (
                        <p className="text-sm opacity-60 text-center py-6">No questions loaded for this module.</p>
                      )
                    ) : (
                      /* --- QUIZ RESULTS SHEET --- */
                      <div className="text-center py-8 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center border-2 border-emerald-500">
                          <Award className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-black ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                            Mock Exam Complete!
                          </h3>
                          <p className="text-sm opacity-70 mt-1">
                            You scored <strong className="text-emerald-500">{quizScore}</strong> correct out of <strong>{activeQuestions.length}</strong> questions!
                          </p>
                          <span className="text-xs font-bold py-1 px-3 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 inline-block">
                            Grade: {Math.round((quizScore / activeQuestions.length) * 100)}% Match
                          </span>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <button
                            id="btn-restart-quiz"
                            onClick={handleQuizRestart}
                            className={`text-xs font-extrabold py-3 px-5 rounded-xl transition-all flex items-center gap-1.5 ${
                              isMidnight
                                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            Retake Quiz
                          </button>
                          
                          <button
                            id="btn-ai-generate-another"
                            onClick={generateAIQuiz}
                            className={`text-xs font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-1.5 ${
                              isMidnight
                                ? 'bg-[#38bdf8] text-[#0f172a]'
                                : 'bg-[#0058be] text-white border-b-4 border-[#004395]'
                            }`}
                          >
                            <Cpu className="w-4 h-4 animate-pulse" />
                            Generate Different MCQs
                          </button>
                        </div>
                      </div>
                    )}

                  </section>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* TAB 3: AI STUDY COMPANION TUTOR                         */}
              {/* ======================================================= */}
              {activeTab === 'ai' && (
                <motion.div
                  key="tab-ai"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-5"
                >
                  <section 
                    className={`flex flex-col h-[500px] overflow-hidden ${
                      isMidnight 
                        ? 'glass-panel rounded-2xl' 
                        : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
                    }`}
                  >
                    
                    {/* Companion Header */}
                    <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-slate-500/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center relative">
                          <MessageSquare className="w-5 h-5" />
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1">
                            Brights AI Study Companion
                          </h3>
                          <span className="text-[10px] opacity-60 block leading-none">Class 10 CBSE Curriculum expert tutor</span>
                        </div>
                      </div>
                      
                      {/* Points notification */}
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-full">
                        +5 XP on every session
                      </span>
                    </div>

                    {/* Chat Bubble Scrollable Canvas */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                      {chatMessages.map((msg, idx) => {
                        const isAi = msg.sender === 'ai';
                        return (
                          <div 
                            key={idx}
                            className={`flex ${isAi ? 'justify-start' : 'justify-end'} items-end gap-2`}
                          >
                            {isAi && (
                              <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                                AI
                              </div>
                            )}
                            <div 
                              className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm font-semibold leading-relaxed whitespace-pre-wrap ${
                                isAi 
                                  ? isMidnight 
                                    ? 'bg-slate-800/80 text-slate-100 border border-slate-700/60 rounded-bl-none' 
                                    : 'bg-[#f1f5f9] text-slate-800 border border-slate-200 rounded-bl-none'
                                  : isMidnight
                                    ? 'bg-[#38bdf8] text-slate-950 rounded-br-none font-bold'
                                    : 'bg-[#0058be] text-white rounded-br-none'
                              }`}
                              style={{
                                boxShadow: !isMidnight && !isAi ? '2px 2px 0px 0px rgba(0,88,190,0.1)' : undefined
                              }}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Loading Chat Bubble */}
                      {chatLoading && (
                        <div className="flex justify-start items-end gap-2">
                          <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                            AI
                          </div>
                          <div className={`p-3 rounded-2xl rounded-bl-none text-xs ${
                            isMidnight ? 'bg-slate-800/80 text-slate-400' : 'bg-[#f1f5f9] text-slate-500'
                          }`}>
                            <span className="flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-violet-500" />
                              Companion is brainstorming detailed answer...
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Tutor Chat Error Notice */}
                      {chatError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{chatError}</span>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Pre-seed Chips Row */}
                    <div className="px-4 py-2 bg-slate-500/5 overflow-x-auto flex gap-2 border-t border-slate-200/30">
                      {[
                        `Summarize Chapter: "${activeChapter.name}" for Board revision`,
                        `Explain key formulas/facts of "${activeChapter.name}" simply`,
                        `Give me 3 board tips for CBSE ${selectedSubject}`,
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          id={`quick-ai-chip-${idx}`}
                          onClick={() => handleSendChatMessage(chip)}
                          className={`text-[10px] py-1 px-3 rounded-full shrink-0 border transition-all font-bold ${
                            isMidnight 
                              ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-sky-400' 
                              : 'bg-white border-slate-200 hover:bg-sky-50 text-slate-600'
                          }`}
                        >
                          {chip.length > 40 ? chip.substring(0, 38) + '...' : chip}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input Field form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="p-3 border-t border-slate-200/50 flex gap-2 items-center bg-slate-500/5"
                    >
                      <input
                        id="ai-tutor-input-box"
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask anything about "${activeChapter.name}" or board preparation...`}
                        className={`flex-1 text-xs md:text-sm font-semibold outline-none py-3 px-4 rounded-xl border ${
                          isMidnight 
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-400' 
                            : 'bg-white border-slate-200 focus:border-[#0058be]'
                        }`}
                      />
                      <button
                        id="ai-tutor-send-btn"
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className={`p-3 rounded-xl text-white transition-all shrink-0 ${
                          !chatInput.trim() || chatLoading
                            ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                            : isMidnight
                              ? 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                              : 'bg-[#0058be] hover:opacity-90 border-b-4 border-[#004395] hover:translate-y-[1px]'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </section>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* TAB 4: BADGES & METRICS SECTION                         */}
              {/* ======================================================= */}
              {activeTab === 'badges' && (
                <motion.div
                  key="tab-badges"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  
                  {/* Performance Bento Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Card 1: Study Points Circle Gauge */}
                    <div 
                      className={`p-5 rounded-2xl flex flex-col items-center gap-3 justify-center ${
                        isMidnight ? 'glass-panel' : 'bg-white border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
                      }`}
                    >
                      <h4 className="text-xs uppercase font-extrabold text-slate-400">XP Points Ring</h4>
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        
                        {/* Circular Progress Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="44" 
                            stroke={isMidnight ? '#1e293b' : '#e2e8f0'} 
                            strokeWidth="8" 
                            fill="transparent" 
                          />
                          <circle 
                            cx="56" 
                            cy="56" 
                            r="44" 
                            stroke={subjectThemeBg} 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray="276"
                            strokeDashoffset={Math.max(0, 276 - (userProgress.points / 500) * 276)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        
                        <div className="absolute text-center">
                          <span className="text-xl font-black block leading-none">{userProgress.points}</span>
                          <span className="text-[9px] uppercase font-bold opacity-60">XP Total</span>
                        </div>
                      </div>
                      <span className="text-[10px] opacity-75 text-center font-bold">500 XP required to clear the Topper Board level!</span>
                    </div>

                    {/* Card 2: Flashcards learned */}
                    <div 
                      className={`p-5 rounded-2xl flex flex-col justify-between ${
                        isMidnight ? 'glass-panel' : 'bg-white border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-1">Study recall progress</h4>
                        <span className="text-3xl font-black">{userProgress.completedFlashcards.length}</span>
                        <span className="text-sm opacity-60 ml-1.5 font-bold">Learned cards</span>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold opacity-75 mb-1.5">
                          <span>Recall Coverage</span>
                          <span>{Math.round((userProgress.completedFlashcards.length / 15) * 100) || 0}% Complete</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.min(100, (userProgress.completedFlashcards.length / 15) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] opacity-50 block mt-2 font-bold">Total high-yield board recall cards: 15</span>
                    </div>

                    {/* Card 3: Board Exam quiz analytics */}
                    <div 
                      className={`p-5 rounded-2xl flex flex-col justify-between ${
                        isMidnight ? 'glass-panel' : 'bg-white border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-slate-400 mb-1">Board Quizzes Played</h4>
                        <span className="text-3xl font-black">
                          {(Object.values(userProgress.quizAttempts) as number[]).reduce((a: number, b: number) => a + b, 0)}
                        </span>
                        <span className="text-sm opacity-60 ml-1.5 font-bold">Attempts</span>
                      </div>

                      {/* Average highest score */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-bold opacity-75 mb-1.5">
                          <span>Highest MCQ Accuracy</span>
                          <span>
                            {(Object.values(userProgress.quizScores) as number[]).length > 0 
                              ? Math.round((Object.values(userProgress.quizScores) as number[]).reduce((a: number, b: number) => a + b, 0) / (Object.values(userProgress.quizScores) as number[]).length)
                              : 0}% Average
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ 
                              width: `${
                                (Object.values(userProgress.quizScores) as number[]).length > 0 
                                  ? Math.min(100, (Object.values(userProgress.quizScores) as number[]).reduce((a: number, b: number) => a + b, 0) / (Object.values(userProgress.quizScores) as number[]).length)
                                  : 0
                              }%` 
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] opacity-50 block mt-2 font-bold">Scores compiled from active subject mock cards.</span>
                    </div>

                  </div>

                  {/* Badges Unlock Trophy Shelf */}
                  <section 
                    className={`${
                      isMidnight 
                        ? 'glass-panel rounded-2xl p-6' 
                        : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-6'
                    }`}
                  >
                    <div className="mb-6">
                      <h3 className={`text-base font-extrabold ${isMidnight ? 'text-white' : 'text-slate-800'}`}>
                        🏆 CBSE Topper Badge Board
                      </h3>
                      <p className="text-xs opacity-75 mt-0.5">Badges unlock automatically as your total score points climb.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {BADGES.map((badge) => {
                        const isUnlocked = userProgress.points >= badge.unlockedAtPoints;
                        
                        return (
                          <div 
                            key={badge.id}
                            id={`badge-card-${badge.id}`}
                            className={`p-4 rounded-xl border-2 text-center flex flex-col items-center justify-between gap-3 transition-all relative overflow-hidden ${
                              isUnlocked 
                                ? isMidnight
                                  ? 'bg-slate-900/60 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                  : 'bg-[#fffbeb] border-[#fdd404] text-slate-800 shadow-sm'
                                : isMidnight
                                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                                  : 'bg-[#f8fafc] border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            {/* Locked Overlay Icon */}
                            {!isUnlocked && (
                              <div className="absolute top-2 right-2">
                                <BadgeAlert className="w-4 h-4 text-slate-400" />
                              </div>
                            )}

                            {/* Badge Reward Points Tag */}
                            <span className="text-[9px] uppercase font-bold bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-full">
                              Requires {badge.unlockedAtPoints} XP
                            </span>

                            {/* Icon rendering dynamically */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                              isUnlocked 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-500 animate-pulse' 
                                : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                            }`}>
                              {badge.iconName === 'Compass' && <Sparkles className="w-6 h-6" />}
                              {badge.iconName === 'GraduationCap' && <GraduationCap className="w-6 h-6" />}
                              {badge.iconName === 'Trophy' && <Trophy className="w-6 h-6" />}
                              {badge.iconName === 'Flame' && <Flame className="w-6 h-6" />}
                            </div>

                            <div className="text-center">
                              <h4 className="text-sm font-black leading-snug">{badge.title}</h4>
                              <p className="text-[10px] leading-relaxed opacity-75 mt-1">{badge.description}</p>
                            </div>

                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              isUnlocked ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                              {isUnlocked ? '● ACTIVE UNLOCKED' : 'LOCKED'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>

          </main>

        </div>

        {/* ======================================================= */}
        {/* SYLLABUS OVERVIEW COMPRESS CARDS                       */}
        {/* ======================================================= */}
        <section 
          id="syllabus-metrics-grid"
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 ${
            isMidnight 
              ? 'glass-panel rounded-2xl p-5' 
              : 'bg-white rounded-2xl border-2 border-slate-200 shadow-[4px_4px_0px_0px_rgba(226,232,240,1)] p-5'
          }`}
        >
          <div className="text-center p-3">
            <span className="text-xs font-bold text-slate-400 uppercase block">Mathematics chapters</span>
            <span className="text-2xl font-black mt-1 block">3 Curated</span>
            <span className="text-[10px] opacity-75 text-emerald-500 font-extrabold mt-1 block">HCF, Quadratics, Trig</span>
          </div>
          <div className="text-center p-3 border-l border-slate-200/50">
            <span className="text-xs font-bold text-slate-400 uppercase block">Science chapters</span>
            <span className="text-2xl font-black mt-1 block">2 Curated</span>
            <span className="text-[10px] opacity-75 text-rose-500 font-extrabold mt-1 block">Reactions, Life Processes</span>
          </div>
          <div className="text-center p-3 border-l border-slate-200/50">
            <span className="text-xs font-bold text-slate-400 uppercase block">Social Science chapters</span>
            <span className="text-2xl font-black mt-1 block">1 Curated</span>
            <span className="text-[10px] opacity-75 text-amber-500 font-extrabold mt-1 block">Nationalism in India</span>
          </div>
          <div className="text-center p-3 border-l border-slate-200/50">
            <span className="text-xs font-bold text-slate-400 uppercase block">English chapters</span>
            <span className="text-2xl font-black mt-1 block">1 Curated</span>
            <span className="text-[10px] opacity-75 text-emerald-500 font-extrabold mt-1 block">Mandela Long Walk</span>
          </div>
        </section>

        {/* --- SYSTEM STATS / HUMBLE FOOTER --- */}
        <footer className="text-center py-4 opacity-50 text-[10px] font-bold flex items-center justify-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>CBSE Class 10 Interactive Study Hub &copy; 2026. Powered by Gemini 3.5.</span>
        </footer>

        {/* --- CUSTOM QUESTION MODALS --- */}
        <AddQuestionModal
          isOpen={isAddQuestionModalOpen}
          onClose={() => setIsAddQuestionModalOpen(false)}
          onSave={handleSaveCustomQuestion}
          currentChapterId={selectedChapterId}
          currentSubject={selectedSubject}
          isMidnight={isMidnight}
        />

        <ManageQuestionsModal
          isOpen={isManageQuestionsModalOpen}
          onClose={() => setIsManageQuestionsModalOpen(false)}
          questions={customQuestions}
          onDeleteQuestion={handleDeleteCustomQuestion}
          onOpenAddModal={() => setIsAddQuestionModalOpen(true)}
          isMidnight={isMidnight}
        />

        {/* PWA Offline Indicator */}
        <OfflineIndicator />

      </div>
    </div>
  );
}
