// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [username, setUsername] = useState('طالب');
  const [studyGoal, setStudyGoal] = useState(120);

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) setSessions(JSON.parse(saved));
    
    const savedName = localStorage.getItem('enjaz_username');
    if (savedName) setUsername(savedName);
    
    const savedGoal = localStorage.getItem('enjaz_goal');
    if (savedGoal) setStudyGoal(parseInt(savedGoal));
  }, []);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayMinutes = sessions.filter(s => new Date(s.startTime) >= todayStart).reduce((sum, s) => sum + s.durationMinutes, 0);
  const progressPercent = Math.min(100, (todayMinutes / studyGoal) * 100);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalSessions = sessions.length;

  const saveUsername = () => {
    localStorage.setItem('enjaz_username', username);
    alert('✅ تم حفظ الاسم!');
  };

  const saveGoal = () => {
    localStorage.setItem('enjaz_goal', studyGoal.toString());
    alert('✅ تم حفظ الهدف!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#5C4B3A]">👤 الملف الشخصي</h1>
        <p className="text-[#8B9E6E] mt-1">إدارة بياناتك وأهدافك الدراسية</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* معلومات المستخدم */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🎓</div>
            <div className="text-2xl font-bold text-[#5C4B3A]">{username}</div>
            <p className="text-[#8B9E6E] text-sm">طالب في منصة إنجاز</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#5C4B3A] mb-1">✏️ اسم المستخدم</label>
              <div className="flex gap-2">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]" />
                <button onClick={saveUsername} className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white hover:bg-[#7A8D5E] transition">حفظ</button>
              </div>
            </div>

            <div>
              <label className="block text-[#5C4B3A] mb-1">🎯 الهدف اليومي (دقائق)</label>
              <div className="flex gap-2">
                <input type="number" value={studyGoal} onChange={(e) => setStudyGoal(parseInt(e.target.value) || 0)} className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]" />
                <button onClick={saveGoal} className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white hover:bg-[#7A8D5E] transition">حفظ</button>
              </div>
            </div>
          </div>
        </div>

        {/* تقدم اليوم */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📅 تقدم اليوم</h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-[#5C4B3A]">{todayMinutes} / {studyGoal}</div>
            <div className="text-sm text-[#8B9E6E]">دقيقة</div>
          </div>
          <div className="w-full bg-[#E8DFD0] rounded-full h-4">
            <div className="bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full h-4 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-center text-[#8B9E6E] text-sm mt-3">
            {progressPercent >= 100 ? '🎉 أتممت هدف اليوم! 🎉' : `تحتاج ${studyGoal - todayMinutes} دقيقة أخرى`}
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="mt-6 bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 إحصائياتي العامة</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/40 rounded-2xl">
            <div className="text-3xl font-bold text-[#5C4B3A]">{totalSessions}</div>
            <div className="text-sm text-[#8B9E6E]">إجمالي الجلسات</div>
          </div>
          <div className="text-center p-4 bg-white/40 rounded-2xl">
            <div className="text-3xl font-bold text-[#5C4B3A]">{Math.floor(totalMinutes / 60)}</div>
            <div className="text-sm text-[#8B9E6E]">إجمالي الساعات</div>
          </div>
        </div>
      </div>
    </div>
  );
}
