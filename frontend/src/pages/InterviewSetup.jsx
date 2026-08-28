import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Terminal, 
  Braces, 
  Globe, 
  Database, 
  Users, 
  Shuffle, 
  Cpu,
  ChevronRight,
  Flame,
  Gauge
} from 'lucide-react';
import { PERSONAS, DEFAULT_PERSONA } from '../data/personas';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('DSA');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Mixed');
  const [persona, setPersona] = useState(DEFAULT_PERSONA);

  const topics = [
    { id: 'Technical', label: 'Technical Core', icon: Cpu, desc: 'Computer networks, operating systems, and general architecture.' },
    { id: 'DSA', label: 'Data Structures & Algos', icon: Braces, desc: 'Arrays, Lists, Trees, Graphs, Sorting, and Search optimization.' },
    { id: 'Java', label: 'Java Ecosystem', icon: Terminal, desc: 'JVM internals, OOPs, Collections, Threading, and Spring fundamentals.' },
    { id: 'Python', label: 'Python Stack', icon: Code, desc: 'Dynamic typing, decorators, generators, data science, and scripting.' },
    { id: 'Web Dev', label: 'Web Development', icon: Globe, desc: 'React, browser lifecycles, CSS architectures, and API patterns.' },
    { id: 'DBMS/SQL', label: 'Database & SQL', icon: Database, desc: 'Normalization, joins, indexes, transactions, and performance query tuning.' },
    { id: 'HR', label: 'HR & Behavioral', icon: Users, desc: 'Scenario responses, leadership skills, conflicts, and career plans.' },
    { id: 'Mixed', label: 'Mixed Bag', icon: Shuffle, desc: 'A multi-subject randomly generated interview session.' },
  ];

  const difficulties = [
    { id: 'Easy', label: 'Easy', desc: 'Focuses on fundamental definition, basic syntax, and standard theories.' },
    { id: 'Medium', label: 'Medium', desc: 'Practical scenarios, design patterns, and standard algorithm optimizations.' },
    { id: 'Hard', label: 'Hard', desc: 'Complex problem-solving, micro-optimizations, and architectural constraints.' },
  ];

  const questionTypes = [
    { id: 'Conceptual', label: 'Conceptual', desc: 'Theoretical explanations, definition queries, and architectural Q&A.' },
    { id: 'Coding/Practical', label: 'Coding / Practical', desc: 'Writing code blocks, explaining algorithms, or sketching solutions.' },
    { id: 'Mixed', label: 'Mixed Format', desc: 'A blend of code walkthroughs, design diagrams, and core theories.' },
  ];

  const handleStart = () => {
    // Navigate to interview page with selected options (state)
    navigate('/interview', { state: { topic, difficulty, questionType, persona } });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-sans">
          Mock Practice Portal
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl mx-auto">
          Configure your mock exam details below. The AI engine adapts question depth based on your selected fields.
        </p>
      </div>

      <div className="space-y-10">
        {/* Step 1: Select Topic */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border/20 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/30">1</span>
            <h2 className="text-lg font-bold text-slate-200">Select Interview Topic</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topics.map((t) => {
              const Icon = t.icon;
              const isSelected = topic === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`text-left p-5 glass-card glass-card-hover border transition-all duration-200 flex flex-col items-start ${
                    isSelected
                      ? 'border-brand-cyan/60 bg-brand-cyan/[0.04] shadow-md shadow-brand-cyan/5 -translate-y-0.5'
                      : 'border-dark-border/40 hover:border-dark-border/90'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-4 border ${
                    isSelected 
                      ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' 
                      : 'bg-white/5 text-slate-400 border-dark-border/60'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm mb-1">{t.label}</h3>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 & 3 Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step 2: Select Difficulty */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-dark-border/20 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/30">2</span>
              <h2 className="text-lg font-bold text-slate-200">Select Difficulty</h2>
            </div>
            <div className="space-y-3">
              {difficulties.map((d) => {
                const isSelected = difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`w-full text-left p-4 glass-card glass-card-hover border transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? 'border-brand-primary/60 bg-brand-primary/[0.04] shadow-md shadow-brand-primary/5'
                        : 'border-dark-border/40'
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg border ${
                      isSelected 
                        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' 
                        : 'bg-white/5 text-slate-400 border-dark-border/60'
                    }`}>
                      <Gauge className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{d.label}</h3>
                      <p className="text-xs text-slate-400 leading-normal mt-1">{d.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Question Format */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-dark-border/20 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/30">3</span>
              <h2 className="text-lg font-bold text-slate-200">Select Question Format</h2>
            </div>
            <div className="space-y-3">
              {questionTypes.map((q) => {
                const isSelected = questionType === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => setQuestionType(q.id)}
                    className={`w-full text-left p-4 glass-card glass-card-hover border transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? 'border-brand-secondary/60 bg-brand-secondary/[0.04] shadow-md shadow-brand-secondary/5'
                        : 'border-dark-border/40'
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg border ${
                      isSelected 
                        ? 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20' 
                        : 'bg-white/5 text-slate-400 border-dark-border/60'
                    }`}>
                      <Flame className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{q.label}</h3>
                      <p className="text-xs text-slate-400 leading-normal mt-1">{q.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Interviewer Persona */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border/20 pb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-brand-primary text-xs font-bold border border-brand-primary/30">4</span>
            <h2 className="text-lg font-bold text-slate-200">Choose Interviewer Persona</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const isSelected = persona === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`text-left p-5 glass-card glass-card-hover border transition-all duration-200 flex flex-col items-start ${
                    isSelected
                      ? 'border-brand-secondary/60 bg-brand-secondary/[0.04] shadow-md shadow-brand-secondary/5 -translate-y-0.5'
                      : 'border-dark-border/40 hover:border-dark-border/90'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-4 border ${
                    isSelected
                      ? 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20'
                      : 'bg-white/5 text-slate-400 border-dark-border/60'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm mb-1">{p.label}</h3>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Launch button section */}
        <div className="flex flex-col items-center border-t border-dark-border/20 pt-8">
          <button onClick={handleStart} className="btn-gradient inline-flex items-center gap-2 px-10 py-4 text-base">
            Launch Mock Arena
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="text-slate-500 text-xs mt-3">
            By launching, a new practice session record will be created. Ensure your microphone/keyboard is ready.
          </p>
        </div>
      </div>
    </div>
  );
}
