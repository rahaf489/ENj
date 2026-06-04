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
  const [studyGoal, setStudyGoal] = useState(120); // دقائق يومياً

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) setSessions(JSON.parse(saved));
    
    const savedName = localStorage.getItem('enjaz_username');
    if (savedName) setUsername(savedName);
    
    const savedGoal = localStorage.getItem('enjaz_goal');
    if (savedGoal) setStudyGoal(parseInt(savedGoal));
  }, []);

  // حساب إنجازات اليوم
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todaySessions = sessions.filter(s => new Date(s.startTime) >= todayStart);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const progressPercent = Math.min(100, (todayMinutes / studyGoal) * 100);

  // الإنجازات الكلية
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalSessions = sessions.length;
  const bestSession = sessions.reduce((best, s) => 
    s.durationMinutes > (best?.durationMinutes || 0) ? s : best, {} as StudySession);
  
  // أيقونات للإنجازات
  const achievements = [
    { name: 'أول جلسة', achieved: totalSessions >= 1, icon: '🌟' },
    { name: '10 جلسات', achieved: totalSessions >= 10, icon: '🎯' },
    { name: '50 جلسة', achieved: totalSessions >= 50, icon: '🏆' },
    { name: 'ساعتان في يوم', achieved: todayMinutes >= 120, icon: '⚡' },
    { name: 'أسبوع كامل', achieved: totalSessions >= 7, icon: '📆' },
  ];

  const saveUsername = () => {
    localStorage.setItem('enjaz_username', username);
    alert('تم حفظ الاسم!');
  };

  const saveGoal = () => {
    localStorage.setItem('enjaz_goal', studyGoal.toString());
    alert('تم حفظ الهدف!');
  };

  const clearAllData = () => {
    if (confirm('⚠️ هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع!')) {
      localStorage.removeItem('enjaz_sessions');
      setSessions([]);
      alert('تم مسح جميع البيانات');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#5C4B3A]">👤 الملف الشخصي</h1>
          <div className="flex gap-4">
            <Link href="/" className="text-[#8B9E6E] hover:text-[#5C4B3A] font-medium px-4 py-2 rounded-xl bg-white/30 backdrop-blur-sm">الرئيسية</Link>
            <Link href="/progress" className="text-[#8B9E6E] hover:text-[#5C4B3A] font-medium px-4 py-2 rounded-xl bg-white/30 backdrop-blur-sm">التقدم</Link>
            <Link href="/profile" className="text-[#8B9E6E] hover:text-[#5C4B3A] font-medium px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm">الملف الشخصي</Link>
          </div>
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
                    className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E]"
                  />
                  <button onClick={saveUsername} className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white">حفظ</button>
                </div>
              </div>

              <div>
                <label className="block text-[#5C4B3A] mb-1">🎯 الهدف اليومي (دقائق)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={studyGoal} 
                    onChange={(e) => setStudyGoal(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E]"
                  />
                  <button onClick={saveGoal} className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white">حفظ</button>
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
              <div className="bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full h-4 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-center text-[#8B9E6E] text-sm mt-3">
              {progressPercent >= 100 ? '🎉 أتممت هدف اليوم! 🎉' : `تحتاج ${studyGoal - todayMinutes} دقيقة أخرى`}
            </p>
          </div>
        </div>

        {/* الإنجازات */}
        <div className="mt-6 bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🏅 الإنجازات</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {achievements.map((ach) => (
              <div key={ach.name} className={`text-center p-3 rounded-xl ${ach.achieved ? 'bg-[#8B9E6E]/20' : 'bg-white/30 opacity-50'}`}>
                <div className="text-2xl">{ach.icon}</div>
                <div className="text-xs text-[#5C4B3A] mt-1">{ach.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#5C4B3A]">{totalSessions}</div>
            <div className="text-xs text-[#8B9E6E]">إجمالي الجلسات</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#5C4B3A]">{Math.floor(totalMinutes / 60)}</div>
            <div className="text-xs text-[#8B9E6E]">إجمالي الساعات</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#5C4B3A]">{bestSession?.durationMinutes || 0}</div>
            <div className="text-xs text-[#8B9E6E]">أفضل جلسة (دقيقة)</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-[#5C4B3A]">{Math.floor(totalMinutes / totalSessions) || 0}</div>
            <div className="text-xs text-[#8B9E6E]">متوسط الجلسة</div>
          </div>
        </div>

        {/* زر مسح البيانات */}
        <div className="mt-6 text-center">
          <button onClick={clearAllData} className="px-6 py-2 rounded-xl text-sm text-red-500 hover:text-red-600 transition-all bg-white/30">
            🗑 مسح جميع البيانات
          </button>
        </div>
      </div>
    </div>
  );
      }
