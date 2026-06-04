// app/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProgressPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  const totalMinutes = sessions.reduce((sum, s: any) => sum + s.durationMinutes, 0);
  const sessionsCount = sessions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-8">
          <Link href="/" className="text-[#8B9E6E]">الرئيسية</Link>
          <Link href="/progress" className="text-[#5C4B3A] font-bold">التقدم</Link>
          <Link href="/profile" className="text-[#8B9E6E]">الملف الشخصي</Link>
        </div>

        <div className="bg-white/60 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-[#5C4B3A] mb-6">📊 إحصائياتي</h1>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
              <div className="text-sm text-[#8B9E6E]">عدد الجلسات</div>
            </div>
            <div className="bg-white/50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
              <div className="text-sm text-[#8B9E6E]">إجمالي الدقائق</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
