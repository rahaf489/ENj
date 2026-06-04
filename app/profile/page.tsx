// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudySession {
  id: string;
  startTime: string;
  durationMinutes: number;
  distractions: any[];
}

export default function ProfilePage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
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
  const todaySessions = sessions.filter(s => new Date(s.startTime) >= todayStart);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const progressPercent = Math.min(100, (todayMinutes / studyGoal) * 100);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalSessions = sessions.length;
  const bestSession = sessions.reduce((best, s) => 
    s.durationMinutes > (best?.durationMinutes || 0) ? s : best, {} as StudySession);

  const achievements = [
    { name: 'أول جلسة', achieved: totalSessions >= 1, icon: '🌟' },
    { name: '10 جلسات', achieved: totalSessions >= 10, icon: '🎯' },
    { name: '50 جلسة', achieved: totalSessions >= 50, icon: '🏆' },
    { name: 'ساعتان في يوم', achieved: todayMinutes >= 120, icon: '⚡' },
    { name: 'أسبوع كامل', achieved: totalSessions >= 7, icon: '📆' },
  ];

  const saveUsername = () => {
    localStorage.setItem('enjaz_username', username);
    alert('✅ تم حفظ الاسم!');
  };

  const saveGoal = () => {
    localStorage.setItem('enjaz_goal', studyGoal.toString());
    alert('✅ تم حفظ الهدف!');
  };

  const clearAllData = () => {
    if (confirm('⚠️ هل أنت متأكد من مسح جميع البيانات؟')) {
      localStorage.removeItem('enjaz_sessions');
      setSessions([]);
      alert('🗑 تم مسح جميع البيانات');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8]">
      {/* شريط التنقل */}
      <nav className="bg-white/30 backdrop-blur-md border-b border-[#8B9E6E]/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-bold text-[#5C4B3A]">إنجاز</h1>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="text-[#5C4B3A]/70 hover:text-[#5C4B3A] transition-colors">الرئيسية</Link>
            <Link href="/progress" className="text-[#5C4B3A]/70 hover:text-[#5C4B3A] transition-colors">التقدم</Link>
            <Link href="/profile" className="text-[#5C4B3A] hover:text-[#8B9E6E] font-medium border-b-2 border-[#8B9E6E] pb-1">الملف الشخصي</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5C4B3A]">👤 الملف الشخصي</h1>
          <p className="text-[#8B9E6E] mt-1">إدارة بياناتك وأهدافك الدراسية</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* معلومات المستخدم */}
          <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">🎓</div>
              <div className="text-2xl font-bold text-[#5C4B3A]">{username}</div>
              <p className="text-[#8B9E6E] text-sm">طالب في منصة إنجاز</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#5C4B3A] mb-1">✏️ اسم المستخدم</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]"
                  />
                  <button onClick={saveUsername} className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white hover:bg-[#7A8D5E] transition">حفظ</button>
                </div>
              </div>

              <div>
                <label className="block text-[#5C4B3A] mb-1">🎯 الهدف اليومي (دقائق)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={studyGoal} 
                    onChange={(e) => setStudyGoal(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A]"
                  />
                  <button onClick={saveGoal} className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white hover:bg-[#7A8D5E] transition">حفظ</button>
                </div>
              </div>
            </div>
          </div>

          {/* تقدم اليوم */}
          <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📅 تقدم اليوم</h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-[#5C4B3A]">{todayMinutes} / {studyGoal}</div>
              <div className="text-sm text-[#8B9E6E]">دقيقة</div>
            </div>
            <div className="w-full bg-[#E8DFD0] rounded-full h-4">
              <div className="bg-gradient-to-r from-[#8B9E6E] to-[#A
