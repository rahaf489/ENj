// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

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

export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentDistractions, setCurrentDistractions] = useState<DistractionLog[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

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

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions.length, 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));

  const startStudy = () => {
    setIsActive(true);
    setCurrentDistractions([]);
    setSeconds(0);
  };

  const pauseStudy = () => setIsActive(false);

  const addDistraction = () => {
    if (isActive) setShowReasonModal(true);
  };

  const confirmDistraction = () => {
    if (selectedReason) {
      setCurrentDistractions([...currentDistractions, {
        id: Date.now().toString(),
        timeFromStart: seconds,
        reason: selectedReason
      }]);
      setSelectedReason('');
      setShowReasonModal(false);
    }
  };

  const endSession = () => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      durationMinutes: Math.floor(seconds / 60),
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
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    if (secs === 0) return `${mins} دقيقة`;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <p className="text-[#8B9E6E] text-lg">مدرب الدراسة الذكي - جودة وليس كمية</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">📚 جلسات اليوم</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">⏱ دقائق دراسة</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center relative">
          <div className="text-3xl font-bold text-[#C4A27A]">{totalDistractions}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">🔔 مرات تشتت</div>
          {isActive && currentDistractions.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
              +{currentDistractions.length}
            </div>
          )}
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-[#8B9E6E]">{focusScore}%</div>
          <div className="text-sm text-[#8B9E6E] mt-1">🎯 مستوى التركيز</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* المؤقت */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-12 text-center">
            <div className="text-8xl md:text-9xl font-mono font-bold text-[#5C4B3A] tabular-nums">
              {formatTime(seconds)}
            </div>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {!isActive ? (
              <button onClick={startStudy} className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg">
                ▶ بدء الدراسة
              </button>
            ) : (
              <>
                <button onClick={pauseStudy} className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all">
                  ⏸ إيقاف مؤقت
                </button>
                <button onClick={endSession} className="px-6 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg">
                  ✅ إنهاء الجلسة
                </button>
              </>
            )}
          </div>

          {isActive && (
            <button onClick={addDistraction} className="w-full px-6 py-3 rounded-2xl font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 border border-orange-500/30 transition-all">
              🔔 تسجيل تشتت ({currentDistractions.length})
            </button>
          )}
        </div>

        {/* قائمة الجلسات */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 آخر الجلسات</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📭</div>
                <p className="text-[#8B9E6E]/60">لا توجد جلسات بعد</p>
              </div>
            ) : (
              sessions.map((session, idx) => (
                <div key={session.id} className="border-b border-[#8B9E6E]/15 pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#5C4B3A] font-mono">#{sessions.length - idx}</span>
                    <span className="text-sm text-[#8B9E6E]">{new Date(session.startTime).toLocaleTimeString('ar-SA')}</span>
                    <span className="text-sm text-[#5C4B3A]">{session.durationMinutes} د • {session.distractions.length} تشتت</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* مودال التشتت */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReasonModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🤔 ما سبب التشتت؟</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
              {distractionReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                    selectedReason === reason ? 'bg-[#8B9E6E] text-white' : 'bg-gray-100 hover:bg-gray-200 text-[#5C4B3A]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowReasonModal(false); setSelectedReason(''); }} className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#5C4B3A]">إلغاء</button>
              <button onClick={confirmDistraction} disabled={!selectedReason} className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white disabled:opacity-50">تأكيد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
