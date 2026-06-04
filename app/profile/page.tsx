// app/profile/page.tsx
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#EDE5D8' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/" style={{ color: '#8B9E6E' }}>الرئيسية</Link>
          <Link href="/progress" style={{ color: '#8B9E6E' }}>التقدم</Link>
          <Link href="/profile" style={{ color: '#5C4B3A', fontWeight: 'bold' }}>الملف الشخصي</Link>
        </div>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', color: '#5C4B3A' }}>👤 الملف الشخصي</h1>
          <p style={{ color: '#8B9E6E', marginTop: '1rem' }}>تم تحديث الصفحة بنجاح!</p>
        </div>
      </div>
    </div>
  );
}
