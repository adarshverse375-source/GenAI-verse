import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  PlusCircle, 
  AlertCircle 
} from 'lucide-react';
import { SubjectType, CustomQuestion } from '../types';
import { CBSE_CHAPTERS } from '../data';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: CustomQuestion) => void;
  currentChapterId: string;
  currentSubject: SubjectType;
  isMidnight: boolean;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentChapterId,
  currentSubject,
  isMidnight
}) => {
  const [subject, setSubject] = useState<SubjectType>(currentSubject);
  const [chapterId, setChapterId] = useState<string>(currentChapterId);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync with current props when opened
  useEffect(() => {
    if (isOpen) {
      setSubject(currentSubject);
      setChapterId(currentChapterId);
      setError(null);
    }
  }, [isOpen, currentSubject, currentChapterId]);

  // Update chapter list when subject changes
  const availableChapters = CBSE_CHAPTERS.filter(c => c.subject === subject);

  // Keep selected chapter valid
  useEffect(() => {
    if (!availableChapters.some(c => c.id === chapterId) && availableChapters.length > 0) {
      setChapterId(availableChapters[0].id);
    }
  }, [subject, availableChapters, chapterId]);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(prev => {
      const next: [string, string, string, string] = [prev[0], prev[1], prev[2], prev[3]];
      next[idx] = value;
      return next;
    });
  };

  const handleFillSample = () => {
    if (subject === 'Mathematics') {
      setQuestionText('What is the discriminant (D) of the quadratic equation 2x² - 4x + 3 = 0?');
      setOptions(['-8', '8', '16', '-16']);
      setCorrectIndex(0);
      setExplanation('D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, there are no real roots.');
    } else if (subject === 'Science') {
      setQuestionText('Which gas is liberated when an acid reacts with a metal?');
      setOptions(['Hydrogen gas (H₂)', 'Carbon dioxide (CO₂)', 'Oxygen gas (O₂)', 'Nitrogen gas (N₂)']);
      setCorrectIndex(0);
      setExplanation('Metals react with dilute acids to produce metal salts and liberate hydrogen gas with a pop sound.');
    } else {
      setQuestionText('Why was the Non-Cooperation Movement called off by Mahatma Gandhi in 1922?');
      setOptions([
        'Due to the violent incident at Chauri Chaura',
        'Due to the Jallianwala Bagh incident',
        'Due to the Simon Commission arrival',
        'Due to the Gandhi-Irwin pact'
      ]);
      setCorrectIndex(0);
      setExplanation('Mahatma Gandhi halted the Non-Cooperation Movement in February 1922 following the Chauri Chaura violence in Gorakhpur.');
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Please write a question description.');
      return;
    }
    for (let i = 0; i < 4; i++) {
      if (!options[i].trim()) {
        setError(`Please fill in Option ${String.fromCharCode(65 + i)}.`);
        return;
      }
    }

    const newQuestion: CustomQuestion = {
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      chapterId,
      questionText: questionText.trim(),
      options: [options[0].trim(), options[1].trim(), options[2].trim(), options[3].trim()],
      correctIndex,
      explanation: explanation.trim() || `The correct option is Option ${String.fromCharCode(65 + correctIndex)}: ${options[correctIndex].trim()}`,
      createdAt: Date.now(),
      author: 'You'
    };

    onSave(newQuestion);
    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8 transition-colors ${
            isMidnight 
              ? 'glass-panel border border-slate-700 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
              : 'bg-white border-2 border-slate-200 shadow-[8px_8px_0px_0px_rgba(203,213,225,1)] text-slate-800'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between border-b pb-4 mb-5 border-slate-200/40">
            <div className="flex items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  isMidnight ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-amber-500 shadow-[0_2px_0_0_#b45309]'
                }`}
              >
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isMidnight ? 'font-jakarta text-white' : 'font-quicksand text-slate-900'}`}>
                  Add Your Own Board Question
                </h3>
                <p className="text-xs opacity-70 mt-0.5">
                  Contribute your own high-yield question to the quiz practice pool (+25 XP)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillSample}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  isMidnight 
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700' 
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                }`}
                title="Populate with a sample question"
              >
                <Sparkles className="w-3 h-3" />
                Fill Sample
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-slate-200/40 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Validation Notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Subject & Chapter Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectType)}
                  className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 border outline-none transition-all ${
                    isMidnight 
                      ? 'bg-slate-900/80 border-slate-700 text-white focus:border-sky-400' 
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="English Literature">English Literature</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5">
                  Chapter
                </label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 border outline-none transition-all ${
                    isMidnight 
                      ? 'bg-slate-900/80 border-slate-700 text-white focus:border-sky-400' 
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                >
                  {availableChapters.map(chap => (
                    <option key={chap.id} value={chap.id}>
                      {chap.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5">
                Question Statement / Problem <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Find the roots of 2x² - 7x + 3 = 0 using the quadratic formula..."
                className={`w-full text-xs font-medium rounded-xl p-3 border outline-none transition-all resize-none ${
                  isMidnight 
                    ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-sky-400' 
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* 4 Options with Correct Answer Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-75">
                  4 Multiple Choice Options <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Select the green radio on the correct answer
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {(['A', 'B', 'C', 'D'] as const).map((letter, idx) => {
                  const isCorrect = correctIndex === idx;
                  return (
                    <div 
                      key={letter}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                        isCorrect
                          ? isMidnight
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-emerald-50 border-emerald-400'
                          : isMidnight
                            ? 'bg-slate-900/40 border-slate-800'
                            : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      {/* Select as Correct Radio Button */}
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(idx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs transition-all shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isMidnight 
                              ? 'bg-slate-800 text-slate-400 hover:text-white' 
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                        title={`Mark Option ${letter} as correct answer`}
                      >
                        {letter}
                      </button>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={options[idx]}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${letter} value...`}
                        className={`w-full text-xs font-semibold bg-transparent outline-none px-2 ${
                          isMidnight ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
                        }`}
                      />

                      {/* Correct Badge Indicator */}
                      {isCorrect && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 shrink-0 px-2 py-0.5 rounded bg-emerald-500/10">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-75 mb-1.5 flex items-center justify-between">
                <span>Explanation / NCERT Solution Step (Optional)</span>
                <span className="text-[10px] opacity-60">Shown to the student after answering</span>
              </label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="e.g. According to NCERT Chapter 4, formula D = b² - 4ac gives..."
                className={`w-full text-xs font-medium rounded-xl p-3 border outline-none transition-all resize-none ${
                  isMidnight 
                    ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-sky-400' 
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/40">
              <button
                type="button"
                onClick={onClose}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                  isMidnight 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                  isMidnight
                    ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-white hover:opacity-90 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                    : 'bg-emerald-600 text-white border-b-4 border-emerald-800 hover:translate-y-[1px] hover:border-b-2 active:translate-y-[3px] active:border-b-0 shadow-sm'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Save Question to Quiz (+25 XP)
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
