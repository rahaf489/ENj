// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  // تحميل البيانات من localStorage
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

  const clearAllData = () => {
    if (confirm('⚠️ هل أنت متأكد من مسح جميع جلسات الدراسة؟')) {
      setSessions([]);
      localStorage.setItem('enjaz_sessions', JSON.stringify([]));
      alert('🗑 تم مسح جميع البيانات');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8]">
      {/* شريط التنقل العلوي */}
      <nav className="bg-white/30 backdrop-blur-md border-b border-[#8B9E6E]/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-bold text-[#5C4B3A]">إنجاز</h1>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="text-[#5C4B3A] hover:text-[#8B9E6E] font-medium transition-colors border-b-2 border-[#8B9E6E] pb-1">الرئيسية</Link>
            <Link href="/progress" className="text-[#5C4B3A]/70 hover:text-[#5C4B3A] transition-colors">التقدم</Link>
            <Link href="/profile" className="text-[#5C4B3A]/70 hover:text-[#5C4B3A] transition-colors">الملف الشخصي</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <p className="text-[#8B9E6E] text-lg">مدرب الدراسة الذكي - جودة وليس كمية</p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center hover:bg-white/70 transition-all duration-300">
            <div className="text-3xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
            <div className="text-sm text-[#8B9E6E] mt-1 flex items-center justify-center gap-1">📚 جلسات اليوم</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center hover:bg-white/70 transition-all duration-300">
            <div className="text-3xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
            <div className="text-sm text-[#8B9E6E] mt-1 flex items-center justify-center gap-1">⏱ دقائق دراسة</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center relative hover:bg-white/70 transition-all duration-300">
            <div className="text-3xl font-bold text-[#C4A27A]">{totalDistractions}</div>
            <div className="text-sm text-[#8B9E6E] mt-1 flex items-center justify-center gap-1">🔔 مرات تشتت</div>
            {isActive && currentDistractions.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse shadow-lg">
                +{currentDistractions.length}
              </div>
            )}
          </div>
          
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center hover:bg-white/70 transition-all duration-300">
            <div className="text-3xl font-bold text-[#8B9E6E]">{focusScore}%</div>
            <div className="text-sm text-[#8B9E6E] mt-1 flex items-center justify-center gap-1">🎯 مستوى التركيز</div>
          </div>
        </div>

        {/* المحتوى الرئيسي: مؤقت + قائمة الجلسات */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* القسم الأيسر: المؤقت */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-12 text-center">
              <div className="text-8xl md:text-9xl font-mono font-bold text-[#5C4B3A] tabular-nums tracking-wider">
                {formatTime(seconds)}
              </div>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              {!isActive ? (
                <button 
                  onClick={startStudy} 
                  className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ▶ بدء الدراسة
                </button>
              ) : (
                <>
                  <button 
                    onClick={pauseStudy} 
                    className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all shadow-md"
                  >
                    ⏸ إيقاف مؤقت
                  </button>
                  <button 
                    onClick={endSession} 
                    className="px-6 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    ✅ إنهاء الجلسة
                  </button>
                </>
              )}
            </div>

            {isActive && (
              <button
                onClick={addDistraction}
                className="w-full px-6 py-3 rounded-2xl font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 border border-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>🔔</span> تسجيل تشتت <span className="text-orange-600 font-bold">({currentDistractions.length})</span>
              </button>
            )}

            {/* نصيحة ذكية */}
            <div className="bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 rounded-3xl p-5 text-center border border-[#8B9E6E]/10">
              <p className="text-[#5C4B3A] text-md">
                💡 {sessionsCount === 0 && !isActive ? "🌱 ابدأ أول جلسة دراسة اليوم" : 
                   focusScore < 35 ? "🌿 جرب جلسات قصيرة 15 دقيقة مع استراحة" :
                   focusScore < 65 ? "🍃 ممتاز! جرب تقنية 25 دقيقة / 5 دقائق راحة" :
                   "🌱 رائع! أنت في حالة تركيز مثالية"}
              </p>
            </div>
          </div>

          {/* القسم الأيمن: قائمة الجلسات الأخيرة */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#5C4B3A] flex items-center gap-2">📊 آخر الجلسات</h3>
              {sessions.length > 0 && (
                <button 
                  onClick={clearAllData}
                  className="text-xs text-[#8B9E6E]/60 hover:text-red-500 transition-colors"
                >
                  🗑 مسح الكل
                </button>
              )}
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pl-1">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">📭</div>
                  <p className="text-[#8B9E6E]/60">لا توجد جلسات بعد</p>
                  <p className="text-[#8B9E6E]/40 text-sm mt-1">ابدأ أول جلسة وانطلق!</p>
                </div>
              ) : (
                sessions.map((session: StudySession, idx: number) => (
                  <div key={session.id} className="border-b border-[#8B9E6E]/15 last:border-0 pb-3 hover:bg-white/30 rounded-xl p-2 transition-all">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8B9E6E] text-sm font-mono">#{sessions.length - idx}</span>
                        <span className="font-medium text-[#5C4B3A] text-sm">
                          🕐 {new Date(session.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-[#5C4B3A] font-mono">{session.durationMinutes} د</span>
                        <span className="text-[#C4A27A]">🔔 {session.distractions?.length || 0}</span>
                      </div>
                    </div>
                    
                    {/* تفاصيل التشتت */}
                    {session.distractions && session.distractions.length > 0 && (
                      <div className="mt-2 mr-6">
                        <div className="flex flex-wrap gap-2">
                          {session.distractions.slice(0, 3).map((dist, i) => (
                            <span key={dist.id} className="text-xs text-[#8B9E6E]/70 bg-white/40 rounded-full px-2 py-0.5">
                              ⏱ {formatTimeFromSeconds(dist.timeFromStart)}
                            </span>
                          ))}
                          {session.distractions.length > 3 && (
                            <span className="text-xs text-[#8B9E6E]/50">+{session.distractions.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-10 pt-6 border-t border-[#8B9E6E]/10">
          <p className="text-[#8B9E6E]/50 text-sm">🌿 ركز على الجودة، ليس فقط الكمية</p>
        </footer>
      </div>

      {/* مودال اختيار سبب التشتت */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReasonModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#5C4B3A]">🤔 ما سبب التشتت؟</h3>
              <button onClick={() => setShowReasonModal(false)} className="text-[#8B9E6E] hover:text-[#5C4B3A] text-2xl">✕</button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              {distractionReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                    selectedReason === reason
                      ? 'bg-[#8B9E6E] text-white shadow-md'
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
                className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
