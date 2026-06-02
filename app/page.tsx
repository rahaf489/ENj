// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

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

// ============ دوال التحليل ============
const calculateFocusScore = (sessions: StudySession[]) => {
  let totalMinutes = 0;
  let totalDistractions = 0;
  
  sessions.forEach(session => {
    totalMinutes += session.durationMinutes;
    totalDistractions += session.distractions;
  });
  
  let focusScore = (sessions.length * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));
  
  let level = '';
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

// ============ مكون المؤقت ============
const StudyTimer = ({ onSessionEnd, onDistractionRecord }: { 
  onSessionEnd: (duration: number, distractions: number) => void;
  onDistractionRecord: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds((s: number) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDistraction = () => {
    if (isActive) {
      setDistractions((d: number) => d + 1);
      onDistractionRecord(); // إعلام الصفحة الرئيسية بتسجيل تشتت
    }
  };

  const endSession = () => {
    if (isActive && seconds >= 60) { // على الأقل دقيقة واحدة
      onSessionEnd(Math.floor(seconds / 60), distractions);
      setIsActive(false);
      setSeconds(0);
      setDistractions(0);
    } else if (seconds < 60 && seconds > 0) {
      alert('الرجاء الدراسة لمدة دقيقة على الأقل لتسجيل الجلسة');
      setIsActive(false);
      setSeconds(0);
      setDistractions(0);
    }
  };

  const cancelSession = () => {
    setIsActive(false);
    setSeconds(0);
    setDistractions(0);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-8 text-center">
      <div className="text-7xl font-mono font-bold mb-6 text-[#5C4B3A]">
        {formatTime(seconds)}
      </div>
      
      <div className="flex gap-4 justify-center mb-6 flex-wrap">
        {!isActive ? (
          <button onClick={() => setIsActive(true)} className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all">
            ▶ بدء الدراسة
          </button>
        ) : (
          <>
            <button onClick={() => setIsActive(false)} className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all">
              ⏸ إيقاف مؤقت
            </button>
            <button onClick={endSession} className="px-6 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all">
              ✅ إنهاء الجلسة
            </button>
            <button onClick={cancelSession} className="px-6 py-3 rounded-2xl font-medium bg-red-500/20 hover:bg-red-500/30 text-red-600 transition-all">
              ✖ إلغاء
            </button>
          </>
        )}
      </div>

      {isActive && (
        <button
          onClick={handleDistraction}
          className="w-full px-6 py-3 rounded-2xl font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 border border-orange-500/30 transition-all"
        >
          🔔 تسجيل تشتت (تم تسجيل {distractions})
        </button>
      )}
    </div>
  );
};

// ============ مكون المهام ============
const TasksList = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const saveTasks = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('enjaz_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdAt: new Date()
    };
    saveTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map((t: any) => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t: any) => t.id !== id));
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
          className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A] placeholder:text-[#8B9E6E]/50"
        />
        <button onClick={addTask} className="px-4 py-2 rounded-xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all">
          ➕
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-[#8B9E6E]/60 text-center py-4">لا توجد مهام بعد</p>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all">
              <button onClick={() => toggleTask(task.id)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                  ${task.completed ? 'bg-[#8B9E6E] border-[#8B9E6E]' : 'border-[#8B9E6E]/40'}`}>
                  {task.completed && '✓'}
                </div>
              </button>
              <span className={`flex-1 text-[#5C4B3A] ${task.completed ? 'line-through text-[#8B9E6E]/60' : ''}`}>
                {task.text}
              </span>
              <button onClick={() => deleteTask(task.id)} className="text-[#C4A27A] hover:text-[#8B5A3A] transition-all">
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState({
    sessionsCount: 0,
    totalMinutes: 0,
    totalDistractions: 0,
    focusScore: 0,
    level: 'ضعيف'
  });

  // تحميل البيانات المحفوظة
  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) {
      const loaded = JSON.parse(saved);
      setSessions(loaded);
      setStats(calculateFocusScore(loaded));
    }
  }, []);

  // تحديث الإحصائيات وحفظها
  const updateStatsAndSave = (updatedSessions: StudySession[]) => {
    setSessions(updatedSessions);
    setStats(calculateFocusScore(updatedSessions));
    localStorage.setItem('enjaz_sessions', JSON.stringify(updatedSessions));
  };

  // إنهاء جلسة دراسة
  const handleSessionEnd = (durationMinutes: number, distractions: number) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      durationMinutes,
      distractions
    };
    
    const updated = [newSession, ...sessions];
    updateStatsAndSave(updated);
    
    // رسالة تأكيد
    alert(`✅ تم تسجيل جلسة: ${durationMinutes} دقيقة، ${distractions} تشتت`);
  };

  // تسجيل تشتت (هذه تضاف للجلسة الحالية عبر المؤقت)
  // لكن نحتاج متغير لحساب التشتتات الكلية
  const handleDistractionRecord = () => {
    // هذه الدالة فقط لتحديث واجهة المستخدم عند الضغط على تشتت
    // التشتتات تسجل داخل الجلسة عند إنهائها
    console.log('تم تسجيل تشتت');
  };

  // نصيحة ذكية حسب الأداء
  const getTip = () => {
    if (stats.focusScore < 35) {
      return "🌿 جرب جلسات قصيرة 15 دقيقة مع استراحة 5 دقائق";
    } else if (stats.focusScore < 65) {
      return "🍃 ممتاز! جرب تقنية 25 دقيقة دراسة / 5 دقائق راحة";
    } else {
      return "🌱 رائع! أنت في حالة تركيز مثالية، استمر بهذا الزخم";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5C4B3A] mb-2">
            🌿 إنجاز
          </h1>
          <p className="text-[#8B9E6E]">مدرب الدراسة الذكي - جودة وليس كمية</p>
        </div>

        {/* Stats Cards - تتحدث الآن بشكل فوري */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#5C4B3A]">{stats.sessionsCount}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">📚 جلسات اليوم</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#5C4B3A]">{stats.totalMinutes}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">⏱ دقائق دراسة</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#C4A27A]">{stats.totalDistractions}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🔔 مرات تشتت</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#8B9E6E]">{stats.focusScore}%</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🎯 مستوى التركيز</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StudyTimer 
              onSessionEnd={handleSessionEnd}
              onDistractionRecord={handleDistractionRecord}
            />
            
            {/* النصيحة الذكية */}
            <div className="bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
              <p className="text-[#5C4B3A] text-lg text-center font-medium">
                💡 {getTip()}
              </p>
            </div>

            {/* آخر الجلسات */}
            {sessions.length > 0 && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 تاريخ الجلسات</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sessions.map((session: StudySession) => (
                    <div key={session.id} className="flex justify-between items-center p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all">
                      <div>
                        <span className="font-mono text-[#5C4B3A] font-semibold">{session.durationMinutes} دقيقة</span>
                        <span className="text-[#8B9E6E] text-sm mx-2">•</span>
                        <span className="text-[#C4A27A]">{session.distractions} تشتت</span>
                      </div>
                      <div className="text-sm text-[#8B9E6E]">
                        {new Date(session.startTime).toLocaleDateString('ar-SA')} - {new Date(session.startTime).toLocaleTimeString('ar-SA')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* مؤشر التركيز المتقدم */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center text-[#5C4B3A]">📈 تحليل التركيز</h3>
              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-[#8B9E6E]">
                  {stats.focusScore}%
                </div>
                <div className="text-sm text-[#8B9E6E] mt-2">مستوى {stats.level}</div>
              </div>
              <div className="w-full bg-[#E8DFD0] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full h-3 transition-all duration-500"
                  style={{ width: `${stats.focusScore}%` }}
                />
              </div>
              <div className="mt-4 text-center text-sm text-[#8B9E6E]">
                {stats.sessionsCount > 0 ? (
                  <>⚡ متوسط {Math.round(stats.totalDistractions / stats.sessionsCount)} تشتت لكل جلسة</>
                ) : (
                  <>📖 ابدأ أول جلسة دراسة</>
                )}
              </div>
            </div>
            
            <TasksList />
          </div>
        </div>

        {/* زر مسح البيانات (للاختبار) */}
        <div className="text-center mt-8">
          <button 
            onClick={() => {
              if (confirm('هل تريد مسح جميع جلسات الدراسة؟')) {
                updateStatsAndSave([]);
                alert('تم مسح جميع البيانات');
              }
            }}
            className="text-sm text-[#8B9E6E]/60 hover:text-[#C4A27A] transition-all"
          >
            🗑 مسح جميع البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
