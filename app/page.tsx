// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

// ============ أنواع البيانات ============
interface DistractionLog {
  id: string;
  timeFromStart: number;
  reason: string;
}

interface StudySession {
  id: string;
  startTime: string;
  durationMinutes: number;
  distractions: DistractionLog[];
}

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentDistractions, setCurrentDistractions] = useState<DistractionLog[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  // أسباب التشتت
  const distractionReasons = [
    '📱 جوال / وسائل تواصل',
    '💭 شرود ذهني / أحلام يقظة',
    '🔊 ضوضاء خارجية',
    '😴 تعب / نعاس',
    '🍽 جوع / عطش',
    '💬 حديث مع شخص',
    '🌐 تصفح إنترنت',
    '🎮 ألعاب',
    '✏️ أسباب أخرى'
  ];

  // المؤقت
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s: number) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // تحميل البيانات
  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error('خطأ في تحميل البيانات', e);
      }
    }
  }, []);

  // حساب الإحصائيات
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + (s.distractions?.length || 0), 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));
  
  let level = 'ضعيف';
  if (focusScore >= 65) level = 'ممتاز';
  else if (focusScore >= 35) level = 'متوسط';

  // دوال التحكم
  const startStudy = () => {
    setIsActive(true);
    setCurrentDistractions([]);
    setSeconds(0);
  };

  const pauseStudy = () => {
    setIsActive(false);
  };

  const addDistraction = () => {
    if (isActive) {
      setShowReasonModal(true);
    }
  };

  const confirmDistraction = () => {
    if (selectedReason) {
      const newDistraction: DistractionLog = {
        id: Date.now().toString(),
        timeFromStart: seconds,
        reason: selectedReason
      };
      setCurrentDistractions([...currentDistractions, newDistraction]);
      setSelectedReason('');
      setShowReasonModal(false);
    }
  };

  const endSession = () => {
    const durationMinutes = Math.floor(seconds / 60);
    
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      durationMinutes: durationMinutes,
      distractions: currentDistractions
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('enjaz_sessions', JSON.stringify(updated));
    
    setIsActive(false);
    setSeconds(0);
    setCurrentDistractions([]);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeFromSeconds = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return '0 ثانية';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    if (secs === 0) return `${mins} دقيقة`;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  const getTip = () => {
    if (sessionsCount === 0 && !isActive) return "🌱 ابدأ أول جلسة دراسة اليوم";
    if (focusScore < 35) return "🌿 جرب جلسات قصيرة 15 دقيقة مع استراحة";
    if (focusScore < 65) return "🍃 ممتاز! جرب تقنية 25 دقيقة / 5 دقائق راحة";
    return "🌱 رائع! أنت في حالة تركيز مثالية";
  };

  const clearData = () => {
    if (confirm('مسح جميع الجلسات؟')) {
      setSessions([]);
      localStorage.setItem('enjaz_sessions', JSON.stringify([]));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5C4B3A] mb-2">🌿 إنجاز</h1>
          <p className="text-[#8B9E6E]">مدرب الدراسة الذكي - جودة وليس كمية</p>
        </div>

        {/* البطاقات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">📚 جلسات اليوم</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">⏱ دقائق دراسة</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center relative hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#C4A27A]">{totalDistractions}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🔔 مرات تشتت</div>
            {isActive && currentDistractions.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
                +{currentDistractions.length}
              </div>
            )}
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center hover:bg-white/70 transition-all">
            <div className="text-3xl font-bold text-[#8B9E6E]">{focusScore}%</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🎯 مستوى التركيز</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* العداد الجميل */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-12 text-center">
              <div className="text-8xl font-mono font-bold text-[#5C4B3A] tabular-nums">
                {formatTime(seconds)}
              </div>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              {!isActive ? (
                <button 
                  onClick={startStudy} 
                  className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg"
                >
                  ▶ بدء الدراسة
                </button>
              ) : (
                <>
                  <button 
                    onClick={pauseStudy} 
                    className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all"
                  >
                    ⏸ إيقاف مؤقت
                  </button>
                  <button 
                    onClick={endSession} 
                    className="px-6 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg"
                  >
                    ✅ إنهاء الجلسة
                  </button>
                </>
              )}
            </div>

            {isActive && (
              <button
                onClick={addDistraction}
                className="w-full px-6 py-3 rounded-2xl font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 border border-orange-500/30 transition-all"
              >
                🔔 تسجيل تشتت ({currentDistractions.length})
              </button>
            )}

            {/* النصيحة */}
            <div className="bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 rounded-3xl p-6 text-center">
              <p className="text-[#5C4B3A] text-lg">💡 {getTip()}</p>
            </div>

            {/* تاريخ الجلسات */}
            {sessions.length > 0 && (
              <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 تاريخ الجلسات</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sessions.map((session: StudySession) => (
                    <div key={session.id} className="border-b border-[#8B9E6E]/20 last:border-0 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-[#5C4B3A]">
                          🕐 {new Date(session.startTime).toLocaleTimeString('ar-SA')}
                        </span>
                        <span className="text-sm text-[#8B9E6E]">
                          {session.durationMinutes} دقيقة • {session.distractions?.length || 0} تشتت
                        </span>
                      </div>
                      
                      {session.distractions && session.distractions.length > 0 && (
                        <div className="mt-2 mr-4">
                          <p className="text-sm font-semibold text-[#C4A27A] mb-1">📝 تفاصيل التشتت:</p>
                          <div className="space-y-1">
                            {session.distractions.map((dist: DistractionLog, idx: number) => (
                              <div key={dist.id} className="text-sm text-[#8B9E6E] flex items-center gap-2">
                                <span className="text-xs">#{idx + 1}</span>
                                <span className="font-mono">⏱ بعد {formatTimeFromSeconds(dist.timeFromStart)}</span>
                                <span>→</span>
                                <span>{dist.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* مستوى التركيز */}
            <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📈 مستوى التركيز</h3>
              <div className="text-6xl font-bold text-[#8B9E6E]">{focusScore}%</div>
              <div className="text-sm text-[#8B9E6E] mt-2">مستوى {level}</div>
              <div className="w-full bg-[#E8DFD0] rounded-full h-3 mt-4">
                <div 
                  className="bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full h-3 transition-all duration-300" 
                  style={{ width: `${focusScore}%` }} 
                />
              </div>
              {isActive && (
                <div className="mt-3 text-xs text-[#8B9E6E] animate-pulse">
                  🔴 جلسة نشطة...
                </div>
              )}
            </div>
            
            {/* المهام */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📋 المهام</h3>
              <TasksList />
            </div>
            
            <button onClick={clearData} className="w-full px-4 py-2 rounded-xl text-sm text-[#8B9E6E]/60 hover:text-[#C4A27A] transition-all bg-white/30">
              🗑 مسح جميع البيانات
            </button>
          </div>
        </div>
      </div>

      {/* نافذة اختيار سبب التشتت */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🤔 ما سبب التشتت؟</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              {distractionReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                    selectedReason === reason
                      ? 'bg-[#8B9E6E] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-[#5C4B3A]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason('');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#5C4B3A] transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDistraction}
                disabled={!selectedReason}
                className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ مكون المهام ============
function TasksList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks([]);
      }
    }
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
    <>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="أضف مهمة جديدة..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A] placeholder:text-[#8B9E6E]/50"
        />
        <button onClick={addTask} className="px-4 py-2 rounded-xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white">➕</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-[#8B9E6E]/60 text-center py-4">لا توجد مهام بعد</p>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all">
              <button onClick={() => toggleTask(task.id)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-[#8B9E6E] border-[#8B9E6E]' : 'border-[#8B9E6E]/40'}`}>
                  {task.completed && '✓'}
                </div>
              </button>
              <span className={`flex-1 text-[#5C4B3A] ${task.completed ? 'line-through text-[#8B9E6E]/60' : ''}`}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="text-[#C4A27A] hover:text-[#8B5A3A] transition-all">🗑️</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
