// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

// ============ أنواع البيانات ============
interface DistractionLog {
  id: string;
  timeFromStart: number;
  reason: string;
}

interface StudySession {
  id: string;
  startTime: string;
  durationMinutes: number;
  distractions: DistractionLog[];
}

// ============ مكون Flip Clock الرقمي ============
const FlipDigit = ({ digit, nextDigit, isFlipping }: { digit: string; nextDigit: string; isFlipping: boolean }) => {
  return (
    <div className="relative inline-block w-20 h-28 mx-1 perspective-1000">
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-[#1a1a2e] rounded-t-lg overflow-hidden shadow-lg border-b border-[#0f0f1a] ${isFlipping ? 'animate-flip-top' : ''}`}>
        <div className="absolute bottom-0 left-0 w-full text-center text-6xl font-mono font-bold text-[#8B9E6E] leading-[56px]">
          {digit}
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-[#1a1a2e] rounded-b-lg overflow-hidden shadow-lg ${isFlipping ? 'animate-flip-bottom' : ''}`}>
        <div className="absolute top-0 left-0 w-full text-center text-6xl font-mono font-bold text-[#8B9E6E] leading-[56px]">
          {nextDigit}
        </div>
      </div>
      
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#0f0f1a] z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-lg pointer-events-none"></div>
    </div>
  );
};

const FlipClock = ({ time }: { time: string }) => {
  const [prevTime, setPrevTime] = useState(time);
  const [flippingDigits, setFlippingDigits] = useState<boolean[]>(new Array(5).fill(false));
  
  useEffect(() => {
    const changes = time.split('').map((digit, i) => digit !== prevTime[i]);
    setFlippingDigits(changes);
    
    const timer = setTimeout(() => {
      setFlippingDigits(new Array(5).fill(false));
      setPrevTime(time);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [time]);
  
  const digits = time.split('');
  const prevDigits = prevTime.split('');
  
  return (
    <div className="flex justify-center items-center gap-1">
      {digits.map((digit, i) => (
        <FlipDigit
          key={i}
          digit={prevDigits[i] || '0'}
          nextDigit={digit}
          isFlipping={flippingDigits[i]}
        />
      ))}
    </div>
  );
};

// ============ مكون تشغيل الصوت من يوتيوب ============
const YouTubeAudioPlayer = ({ videoUrl, isActive, onPlay, onPause }: { 
  videoUrl: string; 
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // استخراج ID الفيديو من رابط يوتيوب
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&enablejsapi=1` : '';

  // تحميل API اليوتيوب
  useEffect(() => {
    if (!videoId) return;

    // إضافة script الـ API إذا لم يكن موجوداً
    if (!document.querySelector('#youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // انتظار تحميل API
    (window as any).onYouTubeIframeAPIReady = () => {
      if (iframeRef.current) {
        new (window as any).YT.Player(iframeRef.current, {
          events: {
            onReady: () => setPlayerReady(true)
          }
        });
      }
    };
  }, [videoId]);

  // التحكم في التشغيل عند بدء/إيقاف الجلسة
  useEffect(() => {
    if (playerReady && iframeRef.current) {
      const iframe = iframeRef.current;
      if (isActive && !isPlaying) {
        // تشغيل الفيديو
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsPlaying(true);
        onPlay();
      } else if (!isActive && isPlaying) {
        // إيقاف الفيديو
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsPlaying(false);
        onPause();
      }
    }
  }, [isActive, playerReady]);

  const togglePlay = () => {
    if (iframeRef.current) {
      if (isPlaying) {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        setIsPlaying(false);
        onPause();
      } else {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setIsPlaying(true);
        onPlay();
      }
    }
  };

  if (!videoId) return null;

  return (
    <div className="mt-3">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="hidden"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#8B9E6E]/10 border border-[#8B9E6E]/20">
        <span className="text-sm text-[#5C4B3A] truncate flex-1">
          🎵 يوتيوب: {videoUrl.length > 40 ? videoUrl.substring(0, 40) + '...' : videoUrl}
        </span>
        <div className="flex gap-2">
          {isPlaying ? (
            <span className="text-xs text-[#8B9E6E] animate-pulse">🔊 يعمل</span>
          ) : (
            <span className="text-xs text-[#8B9E6E]/60">⏸ متوقف</span>
          )}
          <button
            onClick={togglePlay}
            className="text-xs text-[#8B9E6E] hover:text-[#7A8D5E]"
          >
            {isPlaying ? '⏸ إيقاف' : '▶ تشغيل'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ الصفحة الرئيسية ============
export default function Home() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentDistractions, setCurrentDistractions] = useState<DistractionLog[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // أسباب التشتت
  const distractionReasons = [
    '📱 جوال / وسائل تواصل',
    '💭 شرود ذهني / أحلام يقظة',
    '🔊 ضوضاء خارجية',
    '😴 تعب / نعاس',
    '🍽 جوع / عطش',
    '📺 مشاهدة فيديو / يوتيوب',
    '💬 حديث مع شخص',
    '🌐 تصفح إنترنت',
    '🎮 ألعاب',
    '✏️ أسباب أخرى'
  ];

  // أمثلة لروابط صوتية MP3
  const audioSuggestions = [
    { name: '🌧 مطر هادئ', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { name: '🌊 أمواج البحر', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { name: '🔥 نار المدفأة', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { name: '🎹 بيانو هادئ', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  ];

  // أمثلة لروابط يوتيوب (موسيقى هادئة للدراسة)
  const youtubeSuggestions = [
    { name: '🎹 بيانو هادئ للدراسة', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
    { name: '🌙 موسيقى ليلية هادئة', url: 'https://www.youtube.com/watch?v=WPni755-Krg' },
    { name: '📚 موسيقى تركيز للدراسة', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
    { name: '🎻 موسيقى كلاسيكية', url: 'https://www.youtube.com/watch?v=4gLYVQjvGak' },
  ];

  // المؤقت
  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s: number) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // تحميل البيانات
  useEffect(() => {
    const saved = localStorage.getItem('enjaz_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error('خطأ في تحميل البيانات', e);
      }
    }
  }, []);

  // حساب الإحصائيات
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalDistractions = sessions.reduce((sum, s) => sum + (s.distractions?.length || 0), 0);
  const sessionsCount = sessions.length;
  
  let focusScore = (sessionsCount * 10) - (totalDistractions * 5) + Math.floor(totalMinutes / 5);
  focusScore = Math.max(0, Math.min(100, focusScore));
  
  let level = 'ضعيف';
  if (focusScore >= 65) level = 'ممتاز';
  else if (focusScore >= 35) level = 'متوسط';

  // دوال التحكم
  const startStudy = () => {
    setIsActive(true);
    setCurrentDistractions([]);
    setSeconds(0);
  };

  const pauseStudy = () => {
    setIsActive(false);
  };

  const addDistraction = () => {
    if (isActive) {
      setShowReasonModal(true);
    }
  };

  const confirmDistraction = () => {
    if (selectedReason) {
      const newDistraction: DistractionLog = {
        id: Date.now().toString(),
        timeFromStart: seconds,
        reason: selectedReason
      };
      setCurrentDistractions([...currentDistractions, newDistraction]);
      setSelectedReason('');
      setShowReasonModal(false);
    }
  };

  const endSession = () => {
    const durationMinutes = Math.floor(seconds / 60);
    
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      durationMinutes: durationMinutes,
      distractions: currentDistractions
    };
    
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem('enjaz_sessions', JSON.stringify(updated));
    
    setIsActive(false);
    setSeconds(0);
    setCurrentDistractions([]);
  };

  const formatTimeForFlip = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeFromSeconds = (totalSeconds: number) => {
    if (isNaN(totalSeconds)) return '0 ثانية';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    if (secs === 0) return `${mins} دقيقة`;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  const getTip = () => {
    if (sessionsCount === 0 && !isActive) return "🌱 ابدأ أول جلسة دراسة اليوم";
    if (focusScore < 35) return "🌿 جرب جلسات قصيرة 15 دقيقة مع استراحة";
    if (focusScore < 65) return "🍃 ممتاز! جرب تقنية 25 دقيقة / 5 دقائق راحة";
    return "🌱 رائع! أنت في حالة تركيز مثالية";
  };

  const clearData = () => {
    if (confirm('مسح جميع الجلسات؟')) {
      setSessions([]);
      localStorage.setItem('enjaz_sessions', JSON.stringify([]));
    }
  };

  const currentTime = formatTimeForFlip(seconds);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] via-[#EDE5D8] to-[#F5F0E8] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5C4B3A] mb-2">🌿 إنجاز</h1>
          <p className="text-[#8B9E6E]">مدرب الدراسة الذكي - جودة وليس كمية</p>
        </div>

        {/* البطاقات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#5C4B3A]">{sessionsCount}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">📚 جلسات اليوم</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#5C4B3A]">{totalMinutes}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">⏱ دقائق دراسة</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center relative">
            <div className="text-3xl font-bold text-[#C4A27A]">{totalDistractions}</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🔔 مرات تشتت</div>
            {isActive && currentDistractions.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 animate-pulse">
                +{currentDistractions.length}
              </div>
            )}
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-[#8B9E6E]/20 shadow-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#8B9E6E]">{focusScore}%</div>
            <div className="text-sm text-[#8B9E6E] mt-1">🎯 مستوى التركيز</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Flip Clock */}
            <div className="bg-gradient-to-br from-[#2d2d44] to-[#1a1a2e] rounded-3xl shadow-2xl p-12">
              <FlipClock time={currentTime} />
              
              <div className="flex gap-4 justify-center mt-12 flex-wrap">
                {!isActive ? (
                  <button 
                    onClick={startStudy} 
                    className="px-8 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg"
                  >
                    ▶ بدء الدراسة
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={pauseStudy} 
                      className="px-6 py-3 rounded-2xl font-medium bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all"
                    >
                      ⏸ إيقاف مؤقت
                    </button>
                    <button 
                      onClick={endSession} 
                      className="px-6 py-3 rounded-2xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all shadow-lg"
                    >
                      ✅ إنهاء الجلسة
                    </button>
                  </>
                )}
              </div>

              {isActive && (
                <button
                  onClick={addDistraction}
                  className="w-full mt-4 px-6 py-3 rounded-2xl font-medium bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 border border-orange-500/30 transition-all"
                >
                  🔔 تسجيل تشتت (تم تسجيل {currentDistractions.length})
                </button>
              )}
            </div>

            {/* قسم الصوت - MP3 ويوتيوب معاً */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🎵 أصوات للتركيز</h3>
              
              {/* علامات تبويب بسيطة */}
              <div className="flex gap-2 mb-4 border-b border-[#8B9E6E]/20">
                <button className="px-4 py-2 text-[#8B9E6E] border-b-2 border-[#8B9E6E] font-medium">🎧 MP3</button>
                <button className="px-4 py-2 text-[#8B9E6E]/60 hover:text-[#8B9E6E]">▶️ يوتيوب</button>
              </div>

              {/* قسم MP3 */}
              <div>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="أدخل رابط صوت (MP3) أو اختر من الأسفل..."
                  className="w-full mb-4 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A] placeholder:text-[#8B9E6E]/50"
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  {audioSuggestions.map((audio) => (
                    <button
                      key={audio.url}
                      onClick={() => setAudioUrl(audio.url)}
                      className="px-3 py-1.5 rounded-xl text-sm bg-[#8B9E6E]/10 hover:bg-[#8B9E6E]/20 text-[#5C4B3A] transition-all border border-[#8B9E6E]/20"
                    >
                      {audio.name}
                    </button>
                  ))}
                </div>

                {audioUrl && (
                  <audio ref={audioRef} src={audioUrl} loop className="hidden" />
                )}

                {audioUrl && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#8B9E6E]/10 border border-[#8B9E6E]/20">
                    <span className="text-sm text-[#5C4B3A] truncate flex-1">
                      🎵 {audioUrl.length > 40 ? audioUrl.substring(0, 40) + '...' : audioUrl}
                    </span>
                    <div className="flex gap-2">
                      {isAudioPlaying ? (
                        <span className="text-xs text-[#8B9E6E] animate-pulse">🔊 يعمل</span>
                      ) : (
                        <span className="text-xs text-[#8B9E6E]/60">⏸ متوقف</span>
                      )}
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            if (isAudioPlaying) {
                              audioRef.current.pause();
                              setIsAudioPlaying(false);
                            } else {
                              audioRef.current.play();
                              setIsAudioPlaying(true);
                            }
                          }
                        }}
                        className="text-xs text-[#8B9E6E] hover:text-[#7A8D5E]"
                      >
                        {isAudioPlaying ? '⏸ إيقاف' : '▶ تشغيل'}
                      </button>
                      <button
                        onClick={() => {
                          setAudioUrl('');
                          setIsAudioPlaying(false);
                        }}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        ✖ إزالة
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* قسم يوتيوب */}
              <div className="mt-6 pt-4 border-t border-[#8B9E6E]/20">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="أدخل رابط يوتيوب (موسيقى هادئة للدراسة)..."
                  className="w-full mb-4 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A] placeholder:text-[#8B9E6E]/50"
                />

                <div className="flex flex-wrap gap-2 mb-4">
                  {youtubeSuggestions.map((video) => (
                    <button
                      key={video.url}
                      onClick={() => setYoutubeUrl(video.url)}
                      className="px-3 py-1.5 rounded-xl text-sm bg-[#8B9E6E]/10 hover:bg-[#8B9E6E]/20 text-[#5C4B3A] transition-all border border-[#8B9E6E]/20"
                    >
                      {video.name}
                    </button>
                  ))}
                </div>

                {youtubeUrl && (
                  <YouTubeAudioPlayer 
                    videoUrl={youtubeUrl}
                    isActive={isActive}
                    onPlay={() => console.log('يوتيوب يعمل')}
                    onPause={() => console.log('يوتيوب متوقف')}
                  />
                )}
              </div>
            </div>

            {/* النصيحة */}
            <div className="bg-gradient-to-r from-[#8B9E6E]/10 to-[#A8B89A]/10 rounded-3xl p-6 text-center">
              <p className="text-[#5C4B3A] text-lg">💡 {getTip()}</p>
            </div>

            {/* تاريخ الجلسات */}
            {sessions.length > 0 && (
              <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📊 تاريخ الجلسات</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sessions.map((session: StudySession) => (
                    <div key={session.id} className="border-b border-[#8B9E6E]/20 last:border-0 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-[#5C4B3A]">
                          🕐 {new Date(session.startTime).toLocaleTimeString('ar-SA')}
                        </span>
                        <span className="text-sm text-[#8B9E6E]">
                          {session.durationMinutes} دقيقة • {session.distractions?.length || 0} تشتت
                        </span>
                      </div>
                      
                      {session.distractions && session.distractions.length > 0 && (
                        <div className="mt-2 mr-4">
                          <p className="text-sm font-semibold text-[#C4A27A] mb-1">📝 تفاصيل التشتت:</p>
                          <div className="space-y-1">
                            {session.distractions.map((dist: DistractionLog, idx: number) => (
                              <div key={dist.id} className="text-sm text-[#8B9E6E] flex items-center gap-2">
                                <span className="text-xs">#{idx + 1}</span>
                                <span className="font-mono">⏱ بعد {formatTimeFromSeconds(dist.timeFromStart)}</span>
                                <span>→</span>
                                <span>{dist.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/60 rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📈 مستوى التركيز</h3>
              <div className="text-6xl font-bold text-[#8B9E6E]">{focusScore}%</div>
              <div className="text-sm text-[#8B9E6E] mt-2">مستوى {level}</div>
              <div className="w-full bg-[#E8DFD0] rounded-full h-3 mt-4">
                <div className="bg-gradient-to-r from-[#8B9E6E] to-[#A8B89A] rounded-full h-3 transition-all duration-300" style={{ width: `${focusScore}%` }} />
              </div>
              {isActive && <div className="mt-3 text-xs text-[#8B9E6E] animate-pulse">🔴 جلسة نشطة...</div>}
            </div>
            
            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">📋 المهام</h3>
              <TasksList />
            </div>
            
            <button onClick={clearData} className="w-full px-4 py-2 rounded-xl text-sm text-[#8B9E6E]/60 hover:text-[#C4A27A] transition-all bg-white/30">
              🗑 مسح جميع البيانات
            </button>
          </div>
        </div>
      </div>

      {/* نافذة اختيار سبب التشتت */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-[#5C4B3A]">🤔 ما سبب التشتت؟</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
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
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason('');
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#5C4B3A] transition-all"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDistraction}
                disabled={!selectedReason}
                className="flex-1 px-4 py-2 rounded-xl bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ مكون المهام ============
function TasksList() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('enjaz_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks([]);
      }
    }
  }, []);

  const saveTasks = (updatedTasks: any[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('enjaz_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    saveTasks([{ id: Date.now().toString(), text: newTask, completed: false }, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="أضف مهمة جديدة..."
          className="flex-1 px-4 py-2 rounded-xl bg-white/60 border border-[#8B9E6E]/30 focus:outline-none focus:border-[#8B9E6E] text-[#5C4B3A] placeholder:text-[#8B9E6E]/50"
        />
        <button onClick={addTask} className="px-4 py-2 rounded-xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white">➕</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-[#8B9E6E]/60 text-center py-4">لا توجد مهام بعد</p>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 hover:bg-white/60 transition-all">
              <button onClick={() => toggleTask(task.id)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-[#8B9E6E] border-[#8B9E6E]' : 'border-[#8B9E6E]/40'}`}>
                  {task.completed && '✓'}
                </div>
              </button>
              <span className={`flex-1 text-[#5C4B3A] ${task.completed ? 'line-through text-[#8B9E6E]/60' : ''}`}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="text-[#C4A27A] hover:text-[#8B5A3A] transition-all">🗑️</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
