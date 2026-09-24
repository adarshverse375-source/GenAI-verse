import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, HelpCircle, BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import { CustomQuestion } from '../types';
import { CBSE_CHAPTERS } from '../data';

interface ManageQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: CustomQuestion[];
  onDeleteQuestion: (id: string) => void;
  onOpenAddModal: () => void;
  isMidnight: boolean;
}

export const ManageQuestionsModal: React.FC<ManageQuestionsModalProps> = ({
  isOpen,
  onClose,
  questions,
  onDeleteQuestion,
  onOpenAddModal,
  isMidnight
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl p-6 md:p-8 transition-colors ${
            isMidnight 
              ? 'glass-panel border border-slate-700 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
              : 'bg-white border-2 border-slate-200 shadow-[8px_8px_0px_0px_rgba(203,213,225,1)] text-slate-800'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200/40">
            <div>
              <h3 className={`text-xl font-black ${isMidnight ? 'font-jakarta text-white' : 'font-quicksand text-slate-900'}`}>
                My Custom Added Questions ({questions.length})
              </h3>
              <p className="text-xs opacity-70 mt-0.5">
                Questions you have contributed to the syllabus quiz pool
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  isMidnight 
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 hover:bg-sky-500/30' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-slate-200/40 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of Questions */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            {questions.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold opacity-80">No custom questions added yet</h4>
                <p className="text-xs opacity-60 max-w-sm mt-1 mb-4">
                  Create your own CBSE Class 10 mock questions to practice anytime or challenge your classmates!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddModal();
                  }}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create First Question
                </button>
              </div>
            ) : (
              questions.map((q, idx) => {
                const chapter = CBSE_CHAPTERS.find(c => c.id === q.chapterId);
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                      isMidnight 
                        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                          {chapter ? `${chapter.subject} • ${chapter.name}` : 'General CBSE'}
                        </span>
                        <span className="text-[10px] opacity-50">
                          #{idx + 1}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete this question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className={`text-xs md:text-sm font-bold ${isMidnight ? 'text-white' : 'text-slate-900'}`}>
                      {q.questionText}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                            oIdx === q.correctIndex
                              ? isMidnight
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                              : isMidnight
                                ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="opacity-70 font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                          <span className="truncate">{opt}</span>
                          {oIdx === q.correctIndex && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[10px] opacity-70 italic mt-1 border-t pt-1.5 border-slate-200/30">
                        <span className="font-bold not-italic">Explanation:</span> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200/40 mt-3">
            <button
              onClick={onClose}
              className={`text-xs font-bold px-4 py-2 rounded-xl ${
                isMidnight ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
