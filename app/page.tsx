// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ScreenRecorder from '@/components/ScreenRecorder';

// ============ أنواع البيانات ============
interface DistractionLog {
  id: string;
  timeFromStart: number;
  reason: string;
  customReason?: string;
}

interface StudySession {
  id: string;
  sessionNumber: number;
  subjectName: string;
  subjectType: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distractions: DistractionLog[];
}

// ============ أسباب التشتت الجاهزة ============
const distractionReasons = [
  '📱 جوال / وسائل تواصل',
  '💭 شرود ذهني / أحلام يقظة',
  '🔊 ضوضاء خارجية',
  '😴 تعب / نعاس',
  '🍽 جوع / عطش',
  '💬 حديث مع شخص',
  '🌐 تصفح إنترنت',
  '🎮 ألعاب',
  '📺 يوتيوب / فيديو',
  '✏️ سبب آخر (أكتبه)'
];

// ============ أنواع المواد الدراسية ============
const subjectTypes = [
  '📖 حفظ ومراجعة',
  '🧮 رياضيات / علوم',
  '✍️ كتابة / مقالات',
  '💻 برمجة / تقنية',
  '🌐 لغات',
  '📚 قراءة',
  '🎨 رسم / تصميم',
  '🎵 موسيقى',
  '📝 أخرى'
];

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentDistractions, setCurrentDistractions] = useState<DistractionLog[]>([]);
  
  // حالة بدء الجلسة
  const [showStartModal, setShowStartModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectType, setSubjectType] = useState('');
  
  // حالة التشتت
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [currentSessionStartTime, setCurrentSessionStartTime] = useState<Date | null>(null);

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

  // المؤقت
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // حساب الإحصائيات
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions.length, 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));

  // بدء الجلسة
  const openStartModal = () => {
    setShowStartModal(true);
  };

  const confirmStartSession = () => {
    if (!subjectName.trim()) {
      alert('الرجاء إدخال اسم المادة');
      return;
    }
    if (!subjectType) {
      alert('الرجاء اختيار نوع المادة');
      return;
    }
    
    setIsActive(true);
    setCurrentDistractions([]);
    setSeconds(0);
    setCurrentSessionStartTime(new Date());
    setShowStartModal(false);
  };

  // تسجيل تشتت
  const addDistraction = () => {
    if (isActive) {
      setSelectedReason('');
      setCustomReason('');
      setShowReasonModal(true);
    }
  };

  const confirmDistraction = () => {
    let finalReason = selectedReason;
    if (selectedReason === '✏️ سبب آخر (أكتبه)' && customReason.trim()) {
      finalReason = `📝 ${customReason}`;
    }
    
    if (finalReason) {
      const newDistraction: DistractionLog = {
        id: Date.now().toString(),
        timeFromStart: seconds,
        reason: finalReason
      };
      setCurrentDistractions([...currentDistractions, newDistraction]);
      setSelectedReason('');
      setCustomReason('');
      setShowReasonModal(false);
    }
  };

  // إنهاء الجلسة وحفظها
  const endSession = () => {
    const durationMinutes = Math.floor(seconds / 60);
    const nextSessionNumber = sessions.length + 1;
    
    const newSession: StudySession = {
      id: Date.now().toString(),
      sessionNumber: nextSessionNumber,
      subjectName: subjectName,
      subjectType: subjectType,
      startTime: currentSessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: durationMinutes,
      distractions: currentDistractions
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('enjaz_sessions', JSON.stringify(updated));
    
    // إعادة تعيين
    setIsActive(false);
    setSeconds(0);
    setCurrentDistractions([]);
    setSubjectName('');
    setSubjectType('');
    setCurrentSessionStartTime(null);
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

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
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
          <div className="text-sm text-[#8B9E6E] mt-1">📚 إجمالي الجلسات</div>
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
        {/* القسم الأيسر: المؤقت */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-12 text-center">
            <div className="text-8xl md:text-9xl font-mono font-bold text-[#5C4B3A] tabular-nums">
              {formatTime(seconds)}
            </div>
            {isActive && (
              <div className="mt-4 text-sm text-[#8B9E6E]">
                📚 {subjectName} • {subjectType}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {!isActive ? (
              <button onClick={openStartModal} className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg">
                ▶ بدء الدراسة
              </button>
            ) : (
              <>
                <button onClick={() => setIsActive(false)} className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all">
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

        {/* القسم الأيمن: سجل الجلسات */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📋 سجل الجلسات</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📭</div>
                <p className="text-[#8B9E6E]/60">لا توجد جلسات بعد</p>
                <p className="text-[#8B9E6E]/40 text-sm mt-1">ابدأ أول جلسة وانطلق!</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="border-b border-[#8B9E6E]/15 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-[#5C4B3A]">#{session.sessionNumber}</span>
                      <span className="text-[#8B9E6E] text-sm mx-2">•</span>
                      <span className="text-[#5C4B3A]">{session.subjectName}</span>
                      <span className="text-[#8B9E6E] text-xs mr-2">({session.subjectType})</span>
                    </div>
                    <div className="text-sm text-[#8B9E6E]">
                      {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm mb-2">
                    <span className="text-[#5C4B3A]">⏱ {session.durationMinutes} دقيقة</span>
                    <span className="text-[#C4A27A]">🔔 {session.distractions.length} تشتت</span>
                  </div>
                  
                  {/* تفاصيل التشتت */}
                  {session.distractions.length > 0 && (
                    <div className="mt-2 mr-4">
                      <p className="text-xs font-semibold text-[#8B9E6E] mb-1">📝 تفاصيل التشتت:</p>
                      <div className="space-y-1">
                        {session.distractions.map((dist, idx) => (
                          <div key={dist.id} className="text-xs text-[#8B9E6E] flex items-center gap-2">
                            <span>#{idx + 1}</span>
                            <span className="font-mono">⏱ بعد {formatTimeFromSeconds(dist.timeFromStart)}</span>
                            <span>→</span>
                            <span>{dist.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* مودال بدء الجلسة */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStartModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📚 بدء جلسة جديدة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#5C4B3A] mb-1">اسم المادة</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="مثال: الرياضيات, الفيزياء, اللغة العربية..."
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-[#5C4B3A] mb-1">نوع المادة</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {subjectTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSubjectType(type)}
                      className={`px-3 py-2 rounded-xl text-sm transition-all ${
                        subjectType === type
                          ? 'bg-[#8B9E6E] text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-[#5C4B3A]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowStartModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#5C4B3A] transition-all">
                إلغاء
              </button>
              <button onClick={confirmStartSession} className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all">
                بدء الدراسة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال التشتت */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReasonModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🤔 ما سبب التشتت؟</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
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
            
            {selectedReason === '✏️ سبب آخر (أكتبه)' && (
              <div className="mb-4">
                <label className="block text-[#5C4B3A] text-sm mb-1">✏️ اكتب السبب بالتفصيل</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="مثال: فكرت في شيء يقلقني, نسيت إحضار كتاب..."
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]"
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => { setShowReasonModal(false); setSelectedReason(''); setCustomReason(''); }} className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#5C4B3A] transition-all">
                إلغاء
              </button>
              <button onClick={confirmDistraction} disabled={!selectedReason} className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
