// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

// استيراد الأيقونات بشكل صحيح
import { 
  Play, 
  Pause, 
  Square, 
  AlertCircle, 
  Plus, 
  Check, 
  Trash2, 
  Target, 
  Clock, 
  Zap,
  Brain,
  Coffee,
  Moon 
} from 'lucide-react';

// ============ أنواع البيانات ============
interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  distractions: number;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface DailyStats {
  sessionsCount: number;
  totalMinutes: number;
  totalDistractions: number;
  focusScore: number;
  level: 'ضعيف' | 'متوسط' | 'ممتاز';
}

interface Recommendation {
  title: string;
  message: string;
  action: string;
  suggestedDuration: number;
  icon: JSX.Element;
}

// ============ دوال التحليل ============
const calculateFocusScore = (sessions: StudySession[]): DailyStats => {
  let totalMinutes = 0;
  let totalDistractions = 0;
  
  sessions.forEach(session => {
    totalMinutes += session.durationMinutes;
    totalDistractions += session.distractions;
  });
  
  let focusScore = (sessions.length * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));
  
  let level: 'ضعيف' | 'متوسط' | 'ممتاز';
  if (focusScore < 35) level = 'ضعيف';
  else if (focusScore < 65) level = 'متوسط';
  else level = 'ممتاز';
  
  return {
    sessionsCount: sessions.length,
    totalMinutes,
    totalDistractions,
    focusScore,
    level
  };
};

const getRecommendation = (stats: DailyStats): Recommendation => {
  if (stats.focusScore < 35) {
    return {
      title: "🌿 خذ نفسًا عميقًا",
      message: "لاحظنا أن تركيزك متشتت اليوم. ابدأ بجلسات قصيرة ولطيفة.",
      action: "جرب جلسات 15 دقيقة مع استراحة 5 دقائق",
      suggestedDuration: 15,
      icon: <Coffee className="w-8 h-8" />
    };
  } else if (stats.focusScore < 65) {
    return {
      title: "🍃 أنت في طريقك",
      message: "أداء جيد! مع القليل من التنظيم ستصبح أفضل.",
      action: "25 دقيقة دراسة + 5 دقائق راحة",
      suggestedDuration: 25,
      icon: <Brain className="w-8 h-8" />
    };
  } else {
    return {
      title: "🌱 تركيز مذهل!",
      message: "أنت في حالة تدفق رائعة. استمر بهذا الزخم.",
      action: "45 دقيقة دراسة مكثفة + 10 دقائق راحة",
      suggestedDuration: 45,
      icon: <Moon className="w-8 h-8" />
    };
  }
};

// ============ مكون المؤقت ============
const StudyTimer = ({ onSessionEnd }: { onSessionEnd: (duration: number, distractions: number) => void }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDistraction = () => {
    setDistractions(d => d + 1);
  };

  const endSession = () => {
    if (isActive && seconds > 60) {
      onSessionEnd(Math.floor(seconds / 60), distractions);
    }
    setIsActive(false);
    setSeconds(0);
    setDistractions(0);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-8 text-center transition-all duration-300">
      <div className="text-7xl font-mono font-bold mb-6 tabular-nums text-[#5C4B3A]">
        {formatTime(seconds)}
      </div>
      
      <div className="flex gap-4 justify-center mb-6">
        {!isActive ? (
          <button onClick={() => setIsActive(true)} className="px-8 py-3 rounded-2xl font-medium transition-all duration-300 bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white shadow-lg shadow-[#8B9E6E]/20">
            <Play className="inline mr-2 w-5 h-5" /> بدء الدراسة
          </button>
        ) : (
          <>
            <button onClick={() => setIsActive(false)} className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A]">
              <Pause className="inline mr-2 w-5 h-5" /> إيقاف مؤقت
            </button>
            <button onClick={endSession} className="px-6 py-3 rounded-2xl font-medium transition-all duration-300 bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#8B5A3A]">
              <Square className="inline mr-2 w-5 h-5" /> إنهاء
            </button>
          </>
        )}
      </div>

      {isActive && (
        <button
          onClick={handleDistraction}
          className="w-full px-6 py-3 rounded-2xl font-medium transition-all duration-300 bg-[#D4C5B0]/50 hover:bg-[#C9BAA5]/70 text-[#8B5A3A] border border-[#8B9E6E]/20"
        >
          <AlertCircle className="inline mr-2 w-5 h-5" />
          تسجيل تشتت ({distractions})
        </button>
      )}
    </div>
  );
};

// ============ مكون المهام ============
const TasksList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTasks(parsed.map((t: Task) => ({ ...t, createdAt: new Date(t.createdAt) })));
    }
  }, []);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('enjaz_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdAt: new Date()
    };
    saveTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📋 المهام اليومية</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="أضف مهمة جديدة..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A] placeholder-[#8B9E6E]/50"
        />
        <button onClick={addTask} className="px-4 py-2 rounded-xl font-medium transition-all duration-300 bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-[#8B9E6E]/60 text-center py-4">لا توجد مهام بعد</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all duration-200">
              <button onClick={() => toggleTask(task.id)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                  ${task.completed ? 'bg-[#8B9E6E] border-[#8B9E6E]' : 'border-[#8B9E6E]/40'}`}>
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
              <span className={`flex-1 text-[#5C4B3A] ${task.completed ? 'line-through text-[#8B9E6E]/60' : ''}`}>
                {task.text}
              </span>
              <button onClick={() => deleteTask(task.id)} className="text-[#C4A27A] hover:text-[#8B5A3A] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============ مكون الرسم البياني ============
const FocusCircle = ({ score }: { score: number }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-center text-[#5C4B3A]">📈 مؤشر التركيز</h3>
      <div className="relative flex justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#E8DFD0"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B9E6E" />
              <stop offset="100%" stopColor="#A8B89A" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-[#5C4B3A]">{score}%</span>
        </div>
      </div>
    </div>
  );
};

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    sessionsCount: 0,
    totalMinutes: 0,
    totalDistractions: 0,
    focusScore: 0,
    level: 'ضعيف'
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const loaded = parsed.map((s: StudySession) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime)
      }));
      setSessions(loaded);
      const newStats = calculateFocusScore(loaded);
      setStats(newStats);
      setRecommendation(getRecommendation(newStats));
    }
  }, []);

  const updateStats = (sessionsData: StudySession[]) => {
    const newStats = calculateFocusScore(sessionsData);
    setStats(newStats);
    setRecommendation(getRecommendation(newStats));
    localStorage.setItem('enjaz_sessions', JSON.stringify(sessionsData));
  };

  const handleSessionEnd = (durationMinutes: number, distractions: number) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      durationMinutes,
      distractions
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    updateStats(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-[#8B9E6E]/20">
            <span className="text-2xl">🌿</span>
            <span className="text-[#5C4B3A] font-medium">إنجاز</span>
          </div>
          <h1 className="text-4xl font-bold text-[#5C4B3A] mb-2">
            مدرب الدراسة الذكي
          </h1>
          <p className="text-[#8B9E6E]">جودة وليس كمية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all duration-300">
            <Target className="w-6 h-6 mx-auto mb-2 text-[#8B9E6E]" />
            <div className="text-2xl font-bold text-[#5C4B3A]">{stats.sessionsCount}</div>
            <div className="text-xs text-[#8B9E6E]">جلسات اليوم</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all duration-300">
            <Clock className="w-6 h-6 mx-auto mb-2 text-[#8B9E6E]" />
            <div className="text-2xl font-bold text-[#5C4B3A]">{stats.totalMinutes}</div>
            <div className="text-xs text-[#8B9E6E]">دقائق دراسة</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all duration-300">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#C4A27A]" />
            <div className="text-2xl font-bold text-[#5C4B3A]">{stats.totalDistractions}</div>
            <div className="text-xs text-[#8B9E6E]">مرات تشتت</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all duration-300">
            <Zap className="w-6 h-6 mx-auto mb-2 text-[#8B9E6E]" />
            <div className="text-2xl font-bold text-[#5C4B3A]">{stats.level}</div>
            <div className="text-xs text-[#8B9E6E]">المستوى</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StudyTimer onSessionEnd={handleSessionEnd} />
            
            {recommendation && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6 bg-gradient-to-r from-[#F5F0E8] to-white/40">
                <div className="flex items-start gap-4">
                  <div className="text-[#8B9E6E]">{recommendation.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 text-[#5C4B3A]">{recommendation.title}</h3>
                    <p className="text-[#8B9E6E] mb-3">{recommendation.message}</p>
                    <div className="bg-[#8B9E6E]/10 rounded-2xl p-3 border border-[#8B9E6E]/20">
                      <strong className="text-[#5C4B3A]">📌 التوصية:</strong>
                      <span className="text-[#8B9E6E] mr-2">{recommendation.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sessions.length > 0 && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 آخر الجلسات</h3>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all duration-200">
                      <div>
                        <span className="font-mono text-[#5C4B3A]">{session.durationMinutes} دقيقة</span>
                        <span className="text-[#8B9E6E] text-sm mx-2">•</span>
                        <span className="text-[#C4A27A]">{session.distractions} تشتت</span>
                      </div>
                      <div className="text-sm text-[#8B9E6E]">
                        {session.startTime.toLocaleTimeString('ar-SA')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <FocusCircle score={stats.focusScore} />
            <TasksList />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-[#8B9E6E]/60 text-sm">
          <p>🌿 ركز على الجودة، ليس فقط الكمية</p>
        </div>
      </div>
    </div>
  );
}
