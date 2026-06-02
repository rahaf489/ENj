// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, AlertCircle, Plus, Check, Trash2, Target, Clock, Zap } from 'lucide-react';

// ============ أنواع البيانات ============
interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  distractions: number;
  subject?: string;
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

const getRecommendation = (stats: DailyStats) => {
  if (stats.focusScore < 35) {
    return {
      title: "📉 تحسين التركيز مطلوب",
      message: "لاحظنا تشتتًا عاليًا. جرب جلسات قصيرة ومكافآت صغيرة.",
      action: "جرب جلسات 15 دقيقة مع استراحة 5 دقائق",
      suggestedDuration: 15,
      color: "from-orange-500 to-red-500"
    };
  } else if (stats.focusScore < 65) {
    return {
      title: "📈 أداء جيد قابل للتحسين",
      message: "أنت في الطريق الصحيح! تقنية بومودورو سترفع تركيزك أكثر.",
      action: "25 دقيقة دراسة + 5 دقائق راحة",
      suggestedDuration: 25,
      color: "from-blue-500 to-cyan-500"
    };
  } else {
    return {
      title: "🔥 تركيز ممتاز!",
      message: "أداء رائع! يمكنك رفع التحدي بمواد أصعب وجلسات أطول.",
      action: "45 دقيقة دراسة مكثفة + 10 دقائق راحة",
      suggestedDuration: 45,
      color: "from-emerald-500 to-teal-500"
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
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-8 text-center">
      <div className="text-6xl font-mono font-bold mb-6 tabular-nums">
        {formatTime(seconds)}
      </div>
      
      <div className="flex gap-4 justify-center mb-6">
        {!isActive ? (
          <button onClick={() => setIsActive(true)} className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <Play className="inline mr-2 w-5 h-5" /> بدء الدراسة
          </button>
        ) : (
          <>
            <button onClick={() => setIsActive(false)} className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">
              <Pause className="inline mr-2 w-5 h-5" /> إيقاف مؤقت
            </button>
            <button onClick={endSession} className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-red-400">
              <Square className="inline mr-2 w-5 h-5" /> إنهاء
            </button>
          </>
        )}
      </div>

      {isActive && (
        <button
          onClick={handleDistraction}
          className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-white/10 hover:bg-red-500/20 backdrop-blur-sm border border-red-500/30"
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
      setTasks(parsed.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })));
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
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4">📋 المهام اليومية</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="أضف مهمة جديدة..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:border-emerald-500 text-white placeholder-white/50"
        />
        <button onClick={addTask} className="px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-white/50 text-center py-4">لا توجد مهام بعد</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <button onClick={() => toggleTask(task.id)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                  ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'}`}>
                  {task.completed && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
              <span className={`flex-1 ${task.completed ? 'line-through text-white/50' : ''}`}>
                {task.text}
              </span>
              <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-300">
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
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-center">📈 مؤشر التركيز العام</h3>
      <div className="relative flex justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
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
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold">{score}%</span>
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
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const loaded = parsed.map((s: any) => ({
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            إنجاز 🎯
          </h1>
          <p className="text-white/60 mt-2">مدرب الدراسة الذكي - جودة وليس كمية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
            <div className="text-2xl font-bold">{stats.sessionsCount}</div>
            <div className="text-xs text-white/50">جلسات اليوم</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">{stats.totalMinutes}</div>
            <div className="text-xs text-white/50">دقائق دراسة</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold">{stats.totalDistractions}</div>
            <div className="text-xs text-white/50">مرات تشتت</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl font-bold">{stats.level}</div>
            <div className="text-xs text-white/50">المستوى</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StudyTimer onSessionEnd={handleSessionEnd} />
            
            {recommendation && (
              <div className={`bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6 bg-gradient-to-r ${recommendation.color}`}>
                <h3 className="text-xl font-bold mb-2">{recommendation.title}</h3>
                <p className="text-white/90 mb-3">{recommendation.message}</p>
                <div className="bg-black/20 rounded-xl p-3">
                  <strong>📌 التوصية:</strong> {recommendation.action}
                </div>
              </div>
            )}

            {sessions.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4">📊 آخر الجلسات</h3>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map(session => (
                    <div key={session.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                      <div>
                        <span className="font-mono">{session.durationMinutes} دقيقة</span>
                        <span className="text-white/50 text-sm mx-2">•</span>
                        <span className="text-red-400">{session.distractions} تشتت</span>
                      </div>
                      <div className="text-sm text-white/50">
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
      </div>
    </div>
  );
}
