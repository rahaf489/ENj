// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
  sessionType: 'free' | 'pomodoro';
  pomodoroDuration?: number;
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

// ============ أوقات البومودورو المقترحة ============
const pomodoroOptions = [
  { study: 15, break: 5, label: '⏱ 15 دقيقة دراسة + 5 دقائق راحة' },
  { study: 25, break: 5, label: '🎯 25 دقيقة دراسة + 5 دقائق راحة' },
  { study: 30, break: 5, label: '⚡ 30 دقيقة دراسة + 5 دقائق راحة' },
  { study: 45, break: 10, label: '🔥 45 دقيقة دراسة + 10 دقائق راحة' },
  { study: 50, break: 10, label: '💪 50 دقيقة دراسة + 10 دقائق راحة' },
  { study: 60, break: 15, label: '🏆 60 دقيقة دراسة + 15 دقائق راحة' },
];

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentDistractions, setCurrentDistractions] = useState<DistractionLog[]>([]);
  
  // حالة بدء الجلسة
  const [showStartModal, setShowStartModal] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [sessionMode, setSessionMode] = useState<'free' | 'pomodoro' | null>(null);
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [pomodoroBreakDuration, setPomodoroBreakDuration] = useState(5);
  const [targetSeconds, setTargetSeconds] = useState<number | null>(null);
  
  // حالة التشتت
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [currentSessionStartTime, setCurrentSessionStartTime] = useState<Date | null>(null);
  
  // مرجع للمؤقت
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // المؤقت الرئيسي
  useEffect(() => {
    if (isActive && !isBreak) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const newSeconds = s + 1;
          // إذا كان بومودورو ووصلنا للوقت المستهدف
          if (sessionMode === 'pomodoro' && targetSeconds && newSeconds >= targetSeconds) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            alert('🎉 مدة الدراسة انتهت! حان وقت الاستراحة 🎉');
            return targetSeconds;
          }
          return newSeconds;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isBreak, sessionMode, targetSeconds]);

  // حساب الإحصائيات
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions.length, 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));

  // فتح مودال بدء الجلسة
  const openStartModal = () => {
    setSubjectName('');
    setSubjectType('');
    setSessionMode(null);
    setShowStartModal(true);
  };

  // بدء الجلسة (بعد اختيار الإعدادات)
  const confirmStartSession = () => {
    if (!subjectName.trim()) {
      alert('الرجاء إدخال اسم المادة');
      return;
    }
    if (!subjectType) {
      alert('الرجاء اختيار نوع المادة');
      return;
    }
    if (!sessionMode) {
      alert('الرجاء اختيار وضع الدراسة');
      return;
    }
    
    setIsActive(true);
    setIsBreak(false);
    setCurrentDistractions([]);
    setSeconds(0);
    setCurrentSessionStartTime(new Date());
    
    if (sessionMode === 'pomodoro') {
      setTargetSeconds(pomodoroDuration * 60);
    } else {
      setTargetSeconds(null);
    }
    
    setShowStartModal(false);
  };

  // بدء الاستراحة بعد البومودورو
  const startBreak = () => {
    setIsBreak(true);
    setSeconds(0);
    breakTimerRef.current = setInterval(() => {
      setSeconds((s) => {
        const newSeconds = s + 1;
        if (newSeconds >= pomodoroBreakDuration * 60) {
          clearInterval(breakTimerRef.current!);
          setIsBreak(false);
          setIsActive(false);
          alert('⏰ انتهت الاستراحة! يمكنك بدء جلسة جديدة');
          return pomodoroBreakDuration * 60;
        }
        return newSeconds;
      });
    }, 1000);
  };

  // إلغاء الاستراحة
  const cancelBreak = () => {
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    setIsBreak(false);
    setIsActive(false);
    setSeconds(0);
  };

  // إيقاف الجلسة مؤقتاً
  const pauseStudy = () => {
    setIsActive(false);
  };

  // استئناف الجلسة
  const resumeStudy = () => {
    setIsActive(true);
  };

  // تسجيل تشتت
  const addDistraction = () => {
    if (isActive && !isBreak) {
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
    let finalSeconds = seconds;
    // إذا كنا في البومودورو ووصلنا للهدف
    if (sessionMode === 'pomodoro' && targetSeconds && seconds >= targetSeconds) {
      finalSeconds = targetSeconds;
    }
    
    const durationMinutes = Math.floor(finalSeconds / 60);
    const nextSessionNumber = sessions.length + 1;
    
    const newSession: StudySession = {
      id: Date.now().toString(),
      sessionNumber: nextSessionNumber,
      subjectName: subjectName,
      subjectType: subjectType,
      startTime: currentSessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: durationMinutes,
      distractions: currentDistractions,
      sessionType: sessionMode!,
      pomodoroDuration: sessionMode === 'pomodoro' ? pomodoroDuration : undefined
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('enjaz_sessions', JSON.stringify(updated));
    
    // إعادة تعيين
    if (timerRef.current) clearInterval(timerRef.current);
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    setIsActive(false);
    setIsBreak(false);
    setSeconds(0);
    setCurrentDistractions([]);
    setSubjectName('');
    setSubjectType('');
    setSessionMode(null);
    setCurrentSessionStartTime(null);
    setTargetSeconds(null);
  };

  // مسح جميع البيانات
  const clearAllData = () => {
    if (confirm('⚠️ هل أنت متأكد من مسح جميع جلسات الدراسة؟\n\nهذا الإجراء لا يمكن التراجع عنه!')) {
      setSessions([]);
      localStorage.setItem('enjaz_sessions', JSON.stringify([]));
      alert('🗑 تم مسح جميع البيانات بنجاح');
    }
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

  // حساب الوقت المتبقي للبومودورو
  const getRemainingTime = () => {
    if (!targetSeconds) return null;
    const remaining = targetSeconds - seconds;
    if (remaining <= 0) return '0:00';
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          {isActive && !isBreak && currentDistractions.length > 0 && (
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
              {isBreak ? formatTime(seconds) : formatTime(seconds)}
            </div>
            
            {/* حالة الجلسة الحالية */}
            {isActive && !isBreak && (
              <div className="mt-4">
                <div className="text-sm text-[#8B9E6E]">
                  📚 {subjectName} • {subjectType}
                </div>
                {sessionMode === 'pomodoro' && targetSeconds && (
                  <div className="text-xs text-[#8B9E6E] mt-1">
                    ⏳ متبقي: {getRemainingTime()} من {pomodoroDuration}:00
                  </div>
                )}
                {sessionMode === 'free' && (
                  <div className="text-xs text-[#8B9E6E] mt-1">
                    🎯 وقت حر - أنهِ الجلسة متى تشاء
                  </div>
                )}
              </div>
            )}
            
            {isBreak && (
              <div className="mt-4">
                <div className="text-sm text-[#8B9E6E]">☕ وقت استراحة</div>
                <div className="text-xs text-[#8B9E6E] mt-1">متبقي: {formatTime(pomodoroBreakDuration * 60 - seconds)}</div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {!isActive && !isBreak ? (
              <button onClick={openStartModal} className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg">
                ▶ بدء الدراسة
              </button>
            ) : isBreak ? (
              <>
                <button onClick={cancelBreak} className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all">
                  ⏸ إنهاء الاستراحة
                </button>
              </>
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

          {isActive && !isBreak && (
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
                      {session.sessionType === 'pomodoro' && (
                        <span className="text-xs bg-[#8B9E6E]/20 text-[#5C4B3A] px-2 py-0.5 rounded-full mr-2">🍅 بومودورو</span>
                      )}
                    </div>
                    <div className="text-xs text-[#8B9E6E]">
                      {formatDateTime(session.startTime)}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 text-sm mb-2">
                    <span className="text-[#5C4B3A]">⏱ {session.durationMinutes} دقيقة</span>
                    <span className="text-[#C4A27A]">🔔 {session.distractions.length} تشتت</span>
                  </div>
                  
                  {session.distractions.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-[#8B9E6E] cursor-pointer hover:text-[#5C4B3A]">📝 تفاصيل التشتت ({session.distractions.length})</summary>
                      <div className="mt-2 mr-4 space-y-1">
                        {session.distractions.map((dist, idx) => (
                          <div key={dist.id} className="text-xs text-[#8B9E6E] flex items-center gap-2 p-1 hover:bg-white/30 rounded">
                            <span className="text-[#C4A27A]">#{idx + 1}</span>
                            <span className="font-mono">⏱ بعد {formatTimeFromSeconds(dist.timeFromStart)}</span>
                            <span>→</span>
                            <span>{dist.reason}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* زر حذف البيانات - في الأسفل */}
      <div className="mt-8 pt-4 border-t border-[#8B9E6E]/10 text-center">
        <button 
          onClick={clearAllData}
          className="px-4 py-2 rounded-xl text-sm text-red-500/70 hover:text-red-600 transition-all bg-white/30 hover:bg-red-50"
        >
          🗑 مسح جميع البيانات 
        </button>
        <p className="text-[#8B9E6E]/40 text-xs mt-2">
          ملاحظة: هذا الزر مخصص لمسح الجلسات التجريبية القصيرة
        </p>
      </div>

      {/* مودال بدء الجلسة */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStartModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📚 بدء جلسة جديدة</h3>
            
            <div className="space-y-4">
              {/* اسم المادة */}
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
              
              {/* نوع المادة */}
              <div>
                <label className="block text-[#5C4B3A] mb-1">نوع المادة</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
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
              
              {/* وضع الدراسة */}
              <div>
                <label className="block text-[#5C4B3A] mb-2">⚙️ وضع الدراسة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSessionMode('free')}
                    className={`p-3 rounded-xl text-center transition-all ${
                      sessionMode === 'free'
                        ? 'bg-[#8B9E6E] text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-[#5C4B3A]'
                    }`}
                  >
                    <div className="text-xl mb-1">🎯</div>
                    <div className="font-medium">وقت حر</div>
                    <div className="text-xs opacity-70">أنهِ الجلسة متى تشاء</div>
                  </button>
                  <button
                    onClick={() => setSessionMode('pomodoro')}
                    className={`p-3 rounded-xl text-center transition-all ${
                      sessionMode === 'pomodoro'
                        ? 'bg-[#8B9E6E] text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-[#5C4B3A]'
                    }`}
                  >
                    <div className="text-xl mb-1">🍅</div>
                    <div className="font-medium">بومودورو</div>
                    <div className="text-xs opacity-70">وقت محدد + استراحة</div>
                  </button>
                </div>
              </div>
              
              {/* إعدادات البومودورو */}
              {sessionMode === 'pomodoro' && (
                <div>
                  <label className="block text-[#5C4B3A] mb-2">⏱ اختر مدة الدراسة والاستراحة</label>
                  <div className="space-y-2">
                    {pomodoroOptions.map((option) => (
                      <button
                        key={option.study}
                        onClick={() => {
                          setPomodoroDuration(option.study);
                          setPomodoroBreakDuration(option.break);
                        }}
                        className={`w-full px-4 py-2 rounded-xl text-right transition-all ${
                          pomodoroDuration === option.study
                            ? 'bg-[#8B9E6E] text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-[#5C4B3A]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowStartModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#5C4B3A] transition-all">
                إلغاء
              </button>
              <button 
                onClick={confirmStartSession} 
                disabled={!subjectName || !subjectType || !sessionMode}
                className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
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
