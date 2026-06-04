// app/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface StudySession {
  id: string;
  sessionNumber: number;
  subjectName: string;
  subjectType: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distractions: { id: string; timeFromStart: number; reason: string }[];
}

export default function ProgressPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions.length, 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));

  // تحليل أسباب التشتت
  const distractionReasons: { [key: string]: number } = {};
  sessions.forEach(session => {
    session.distractions.forEach(d => {
      const baseReason = d.reason.split(' ').slice(1).join(' ');
      distractionReasons[baseReason] = (distractionReasons[baseReason] || 0) + 1;
    });
  });

  // جلسات حسب المادة
  const sessionsBySubject: { [key: string]: { count: number; minutes: number } } = {};
  sessions.forEach(session => {
    if (!sessionsBySubject[session.subjectName]) {
      sessionsBySubject[session.subjectName] = { count: 0, minutes: 0 };
    }
    sessionsBySubject[session.subjectName].count++;
    sessionsBySubject[session.subjectName].minutes += session.durationMinutes;
  });

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
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
        <h1 className="text-3xl font-bold text-[#5C4B3A]">📊 التقدم والإنجاز</h1>
        <p className="text-[#8B9E6E] mt-1">تحليل شامل لأدائك الدراسي</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">إجمالي الجلسات</div>
        </div>
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#5C4B3A]">{Math.floor(totalMinutes / 60)}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">إجمالي الساعات</div>
        </div>
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#C4A27A]">{totalDistractions}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">إجمالي التشتتات</div>
        </div>
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#8B9E6E]">{focusScore}%</div>
          <div className="text-sm text-[#8B9E6E] mt-1">مستوى التركيز</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* أسباب التشتت */}
        <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🔍 أكثر أسباب التشتت</h3>
          <div className="space-y-3">
            {Object.entries(distractionReasons).length === 0 ? (
              <p className="text-center text-[#8B9E6E]/60 py-4">لا توجد بيانات كافية</p>
            ) : (
              Object.entries(distractionReasons).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([reason, count]) => (
                <div key={reason} className="flex items-center gap-3">
                  <span className="flex-1 text-[#5C4B3A] text-sm">{reason}</span>
                  <div className="flex-1 h-2 bg-[#E8DFD0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8B9E6E] rounded-full" style={{ width: `${(count / totalDistractions) * 100}%` }} />
                  </div>
                  <span className="text-[#8B9E6E] font-bold text-sm">{count} مرة</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* الدراسة حسب المادة */}
        <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📚 الدراسة حسب المادة</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Object.entries(sessionsBySubject).length === 0 ? (
              <p className="text-center text-[#8B9E6E]/60 py-4">لا توجد بيانات كافية</p>
            ) : (
              Object.entries(sessionsBySubject).map(([subject, data]) => (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#5C4B3A]">{subject}</span>
                    <span className="text-[#8B9E6E]">{data.count} جلسة • {data.minutes} دقيقة</span>
                  </div>
                  <div className="h-2 bg-[#E8DFD0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C4A27A] rounded-full" style={{ width: `${(data.minutes / totalMinutes) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* قائمة الجلسات التفصيلية */}
      <div className="mt-6 bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📋 جميع الجلسات التفصيلية</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-center text-[#8B9E6E]/60 py-8">ابدأ أول جلسة لعرض التفاصيل</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="border-b border-[#8B9E6E]/15 pb-4 last:border-0">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="font-bold text-[#5C4B3A]">#{session.sessionNumber}</span>
                    <span className="text-[#8B9E6E] text-sm mx-2">•</span>
                    <span className="font-medium text-[#5C4B3A]">{session.subjectName}</span>
                    <span className="text-[#8B9E6E] text-xs mr-2">({session.subjectType})</span>
                  </div>
                  <div className="text-xs text-[#8B9E6E] font-mono">
                    {formatDateTime(session.startTime)} → {formatDateTime(session.endTime)}
                  </div>
                </div>
                
                <div className="flex gap-4 text-sm mb-2">
                  <span className="text-[#5C4B3A]">⏱ {session.durationMinutes} دقيقة</span>
                  <span className="text-[#C4A27A]">🔔 {session.distractions.length} تشتت</span>
                </div>
                
                {session.distractions.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-[#8B9E6E] cursor-pointer hover:text-[#5C4B3A]">📝 عرض تفاصيل التشتت ({session.distractions.length})</summary>
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

      {/* رسالة تحفيزية */}
      <div className="mt-6 bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 rounded-3xl p-6 text-center">
        <p className="text-[#5C4B3A]">
          {focusScore >= 70 
            ? "🎉 أداء ممتاز! أنت في طريقك للتفوق. استمر بهذا الزخم!" 
            : focusScore >= 40 
              ? "📈 أداء جيد! مع القليل من التحسين ستصبح أفضل. ركز على أسباب التشتت الأكثر تكراراً."
              : sessionsCount > 0 
                ? "🌱 بداية جيدة! جرب تقنيات التركيز مثل البومودورو وقلل المشتتات حولك."
                : "🌟 ابدأ رحلتك الدراسية مع إنجاز وسجل أول جلسة!"}
        </p>
      </div>
    </div>
  );
}
