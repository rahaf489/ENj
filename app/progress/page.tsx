// app/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ProgressPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  const getFilteredSessions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      if (filter === 'day') return sessionDate >= today;
      if (filter === 'week') return sessionDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return sessionDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    });
  };

  const filteredSessions = getFilteredSessions();
  const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalDistractions = filteredSessions.reduce((sum, s) => sum + s.distractions?.length || 0, 0);
  const sessionsCount = filteredSessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));

  const distractionReasons: { [key: string]: number } = {};
  filteredSessions.forEach(session => {
    session.distractions?.forEach((d: any) => {
      distractionReasons[d.reason] = (distractionReasons[d.reason] || 0) + 1;
    });
  });

  const sessionsByDay: { [key: string]: number } = {};
  filteredSessions.forEach(session => {
    const day = new Date(session.startTime).toLocaleDateString('ar-SA');
    sessionsByDay[day] = (sessionsByDay[day] || 0) + session.durationMinutes;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#5C4B3A]">📊 التقدم والإنجاز</h1>
        <p className="text-[#8B9E6E] mt-1">تتبع تطورك وتحليل أدائك</p>
      </div>

      {/* أزرار الفلتر */}
      <div className="flex gap-3 mb-8 justify-center">
        {[
          { key: 'day', label: 'اليوم', icon: '☀️' },
          { key: 'week', label: 'الأسبوع', icon: '📅' },
          { key: 'month', label: 'الشهر', icon: '📆' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filter === item.key ? 'bg-[#8B9E6E] text-white shadow-lg' : 'bg-white/50 text-[#5C4B3A] hover:bg-white/70'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">جلسات</div>
        </div>
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">دقائق دراسة</div>
        </div>
        <div className="bg-white/60 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-[#C4A27A]">{totalDistractions}</div>
          <div className="text-sm text-[#8B9E6E] mt-1">مرات تشتت</div>
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
              Object.entries(distractionReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                <div key={reason} className="flex items-center gap-3">
                  <span className="text-lg">{reason.split(' ')[0]}</span>
                  <span className="flex-1 text-[#5C4B3A] text-sm">{reason.substring(2)}</span>
                  <span className="text-[#8B9E6E] font-bold">{count} مرة</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ساعات الدراسة اليومية */}
        <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📈 ساعات الدراسة اليومية</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Object.entries(sessionsByDay).length === 0 ? (
              <p className="text-center text-[#8B9E6E]/60 py-4">لا توجد بيانات كافية</p>
            ) : (
              Object.entries(sessionsByDay).map(([day, minutes]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm text-[#5C4B3A] w-24">{day}</span>
                  <div className="flex-1 h-8 bg-[#E8DFD0] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full flex items-center justify-end px-3 text-xs text-white" style={{ width: `${Math.min(100, (minutes / 120) * 100)}%` }}>
                      {Math.floor(minutes / 60)}س {minutes % 60}د
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ملخص */}
      <div className="mt-6 bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 rounded-3xl p-6 text-center">
        <p className="text-[#5C4B3A] text-lg">
          {filter === 'day' && `📅 اليوم: ${sessionsCount} جلسة, ${totalMinutes} دقيقة`}
          {filter === 'week' && `📆 هذا الأسبوع: ${sessionsCount} جلسة, ${totalMinutes} دقيقة`}
          {filter === 'month' && `📅 هذا الشهر: ${sessionsCount} جلسة, ${totalMinutes} دقيقة`}
        </p>
        {focusScore >= 70 && <p className="text-[#8B9E6E] mt-2">🎉 أداء ممتاز! استمر بهذا التقدم!</p>}
        {focusScore < 40 && sessionsCount > 0 && <p className="text-[#C4A27A] mt-2">🌱 التركيز يحتاج تحسين، جرب جلسات أقصر</p>}
      </div>
    </div>
  );
}
