// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [username, setUsername] = useState('طالب');

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_username');
    if (saved) setUsername(saved);
  }, []);

  const saveName = () => {
    localStorage.setItem('enjaz_username', username);
    alert('تم الحفظ!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-8">
          <Link href="/" className="text-[#8B9E6E]">الرئيسية</Link>
          <Link href="/progress" className="text-[#8B9E6E]">التقدم</Link>
          <Link href="/profile" className="text-[#5C4B3A] font-bold">الملف الشخصي</Link>
        </div>

        <div className="bg-white/60 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-[#5C4B3A] mb-6">👤 ملفي الشخصي</h1>
          
          <div className="flex gap-4 items-center">
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#8B9E6E]/30 bg-white/60"
            />
            <button 
              onClick={saveName}
              className="px-4 py-2 rounded-xl bg-[#8B9E6E] text-white"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
