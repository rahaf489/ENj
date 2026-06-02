// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

// ============ مكون المؤقت ============
const StudyTimer = ({ 
  onAddSession, 
  onLiveDistraction 
}: { 
  onAddSession: (duration: number, distractions: number) => void;
  onLiveDistraction: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s: number) => s + 1);
      }, 1000);
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
      onLiveDistraction(); // تحديث فوري للبطاقة العلوية
    }
  };

  const endSession = () => {
    if (isActive && seconds >= 60) {
      onAddSession(Math.floor(seconds / 60), distractions);
      setIsActive(false);
      setSeconds(0);
      setDistractions(0);
    } else if (seconds > 0 && seconds < 60) {
      alert('⚠️ الرجاء الدراسة لمدة دقيقة على الأقل');
      setIsActive(false);
      setSeconds(0);
      setDistractions(0);
    }
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
          </>
        )}
      </div>

      {isActive && (
        <button
          onClick={handleDistraction}
          className="w-full px-6 py-3 rounded-2xl font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 border border-orange-500/30 transition-all"
        >
          🔔 تسجيل تشتت ({distractions})
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
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const saveTasks = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('enjaz_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    saveTasks([{ id: Date.now().toString(), text: newTask, completed: false }, ...tasks]);
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
          className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]"
        />
        <button onClick={addTask} className="px-4 py-2 rounded-xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white">➕</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-[#8B9E6E]/60 text-center py-4">لا توجد مهام بعد</p>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/40">
              <button onClick={() => toggleTask(task.id)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.completed ? 'bg-[#8B9E6E] border-[#8B9E6E]' : 'border-[#8B9E6E]/40'}`}>
                  {task.completed && '✓'}
                </div>
              </button>
              <span className={`flex-1 text-[#5C4B3A] ${task.completed ? 'line-through text-[#8B9E6E]/60' : ''}`}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="text-[#C4A27A]">🗑️</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [liveDistractions, setLiveDistractions] = useState(0); // التشتتات الحية في الجلسة الحالية
  const [isSessionActive, setIsSessionActive] = useState(false);

  // حساب الإحصائيات من الجلسات + التشتتات الحية
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const savedDistractions = sessions.reduce((sum, s) => sum + s.distractions, 0);
  const totalDistractions = savedDistractions + (isSessionActive ? liveDistractions : 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));
  
  let level = 'ضعيف';
  if (focusScore >= 65) level = 'ممتاز';
  else if (focusScore >= 35) level = 'متوسط';

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  // بدء جلسة جديدة
  const startSession = () => {
    setIsSessionActive(true);
    setLiveDistractions(0);
  };

  // تسجيل تشتت فوري
  const recordDistraction = () => {
    if (isSessionActive) {
      setLiveDistractions(prev => prev + 1);
    }
  };

  // إضافة جلسة كاملة
  const addSession = (durationMinutes: number, distractions: number) => {
    const newSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      durationMinutes,
      distractions
    };
    
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('enjaz_sessions', JSON.stringify(updatedSessions));
    setIsSessionActive(false);
    setLiveDistractions(0);
    
    alert(`✅ تم تسجيل جلسة: ${durationMinutes} دقيقة، ${distractions} تشتت`);
  };

  // مسح جميع البيانات
  const clearData = () => {
    if (confirm('مسح جميع الجلسات؟')) {
      setSessions([]);
      localStorage.setItem('enjaz_sessions', JSON.stringify([]));
      setIsSessionActive(false);
      setLiveDistractions(0);
    }
  };

  // نصيحة ذكية
  const getTip = () => {
    if (sessionsCount === 0 && !isSessionActive) return "🌱 ابدأ أول جلسة دراسة اليوم";
    if (focusScore < 35) return "🌿 جرب جلسات قصيرة 15 دقيقة";
    if (focusScore < 65) return "🍃 ممتاز! جرب تقنية 25/5 دقائق";
    return "🌱 رائع! أنت في حالة تركيز مثالية";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5C4B3A] mb-2">🌿 إنجاز</h1>
          <p className="text-[#8B9E6E]">مدرب الدراسة الذكي - جودة وليس كمية</p>
        </div>

        {/* Stats Cards - تتحدث فوراً عند الضغط على تشتت */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">📚 جلسات اليوم</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">⏱ دقائق دراسة</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#C4A27A]">{totalDistractions}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🔔 مرات تشتت</div>
            {isSessionActive && liveDistractions > 0 && (
              <div className="text-xs text-orange-500 mt-1 animate-pulse">+{liveDistractions} جديد</div>
            )}
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#8B9E6E]">{focusScore}%</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🎯 مستوى التركيز</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StudyTimer 
              onAddSession={addSession}
              onLiveDistraction={recordDistraction}
            />
            
            <div className="bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 rounded-3xl p-6 text-center">
              <p className="text-[#5C4B3A] text-lg">💡 {getTip()}</p>
            </div>

            {sessions.length > 0 && (
              <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 آخر الجلسات</h3>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((session: any) => (
                    <div key={session.id} className="flex justify-between items-center p-3 rounded-xl bg-white/40">
                      <span className="font-mono text-[#5C4B3A]">{session.durationMinutes} دقيقة • {session.distractions} تشتت</span>
                      <span className="text-sm text-[#8B9E6E]">{new Date(session.startTime).toLocaleTimeString('ar-SA')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📈 مستوى التركيز</h3>
              <div className="text-6xl font-bold text-[#8B9E6E]">{focusScore}%</div>
              <div className="text-sm text-[#8B9E6E] mt-2">مستوى {level}</div>
              <div className="w-full bg-[#E8DFD0] rounded-full h-3 mt-4">
                <div className="bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full h-3 transition-all duration-300" style={{ width: `${focusScore}%` }} />
              </div>
              {isSessionActive && (
                <div className="mt-3 text-xs text-[#8B9E6E] animate-pulse">
                  🔴 جلسة نشطة...
                </div>
              )}
            </div>
            
            <TasksList />
            
            <button onClick={clearData} className="w-full px-4 py-2 rounded-xl text-sm text-[#8B9E6E]/60 hover:text-[#C4A27A] transition-all bg-white/30">
              🗑 مسح جميع البيانات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
