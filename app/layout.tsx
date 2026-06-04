// app/layout.tsx
import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنجاز - منصة تحليل التركيز والدراسة',
  description: 'تطبيق لتحليل جودة الدراسة وتتبع التشتت',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* شريط التنقل العلوي - يظهر في كل الصفحات */}
        <nav className="bg-white/30 backdrop-blur-md border-b border-[#8B9E6E]/20 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <h1 className="text-2xl font-bold text-[#5C4B3A]">إنجاز</h1>
            </div>
            <div className="flex gap-6">
              <Link href="/" className="text-[#5C4B3A] hover:text-[#8B9E6E] transition-colors">الرئيسية</Link>
              <Link href="/progress" className="text-[#5C4B3A] hover:text-[#8B9E6E] transition-colors">التقدم</Link>
              <Link href="/profile" className="text-[#5C4B3A] hover:text-[#8B9E6E] transition-colors">الملف الشخصي</Link>
            </div>
          </div>
        </nav>
        
        {/* محتوى الصفحة */}
        <main>{children}</main>
      </body>
    </html>
  );
}
