// components/ScreenRecorder.tsx
'use client';

import { useState, useRef } from 'react';

interface ScreenRecorderProps {
  isSessionActive: boolean;
  onRecordingComplete?: (blob: Blob) => void;
}

export default function ScreenRecorder({ isSessionActive, onRecordingComplete }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('⏹ غير مفعل');
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // بدء التسجيل
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        if (onRecordingComplete) onRecordingComplete(blob);
        setRecordingStatus('⏹ متوقف');
        setIsRecording(false);
        
        // إيقاف عداد المدة
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingStatus('🔴 تسجيل...');
      setRecordingDuration(0);
      
      // بدء عداد المدة
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('خطأ في بدء التسجيل:', error);
      setRecordingStatus('❌ فشل التسجيل');
    }
  };

  // إيقاف التسجيل
  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  // تحميل التسجيل
  const downloadRecording = () => {
    if (recordedVideo) {
      const a = document.createElement('a');
      a.href = recordedVideo;
      a.download = `session-recording-${new Date().toISOString()}.webm`;
      a.click();
    }
  };

  // مشاركة التسجيل (نسخ الرابط)
  const shareRecording = async () => {
    if (recordedVideo) {
      try {
        await navigator.clipboard.writeText(recordedVideo);
        alert('✅ تم نسخ رابط التسجيل!');
      } catch (err) {
        alert('❌ فشل نسخ الرابط');
      }
    }
  };

  // حذف التسجيل
  const deleteRecording = () => {
    setRecordedVideo(null);
    chunksRef.current = [];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} ثانية`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-[#8B9E6E]/20 shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-[#5C4B3A] flex items-center gap-2">
        🎥 تسجيل الجلسات
        <span className="text-xs text-[#8B9E6E]/60 font-normal">(تجريبي)</span>
      </h3>
      
      <div className="space-y-4">
        {/* حالة التسجيل */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#8B9E6E]/10 border border-[#8B9E6E]/20">
          <span className="text-sm text-[#5C4B3A]">📹 حالة التسجيل:</span>
          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-500 font-mono">{formatDuration(recordingDuration)}</span>
              </div>
            )}
            <span className={`text-sm font-medium ${isRecording ? 'text-red-500' : 'text-[#8B9E6E]'}`}>
              {recordingStatus}
            </span>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startScreenRecording}
              disabled={!isSessionActive}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isSessionActive
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>🔴</span> بدء التسجيل
            </button>
          ) : (
            <button
              onClick={stopScreenRecording}
              className="flex-1 px-4 py-3 rounded-xl font-medium bg-orange-500 hover:bg-orange-600 text-white transition-all flex items-center justify-center gap-2"
            >
              <span>⏹</span> إيقاف التسجيل
            </button>
          )}

          {recordedVideo && (
            <button
              onClick={downloadRecording}
              className="px-4 py-3 rounded-xl font-medium bg-[#8B9E6E] hover:bg-[#7A8D5E] text-white transition-all flex items-center gap-2"
            >
              💾 تحميل
            </button>
          )}
        </div>

        {/* إضافات: مشاركة وحذف */}
        {recordedVideo && (
          <div className="flex gap-2">
            <button
              onClick={shareRecording}
              className="flex-1 px-3 py-2 rounded-xl text-sm bg-[#D4C5B0] hover:bg-[#C9BAA5] text-[#5C4B3A] transition-all flex items-center justify-center gap-1"
            >
              📤 مشاركة
            </button>
            <button
              onClick={deleteRecording}
              className="px-3 py-2 rounded-xl text-sm bg-red-100 hover:bg-red-200 text-red-600 transition-all flex items-center gap-1"
            >
              🗑 حذف
            </button>
          </div>
        )}

        {/* معاينة الفيديو المسجل */}
        {recordedVideo && (
          <div className="mt-4">
            <p className="text-sm text-[#8B9E6E] mb-2">📹 معاينة التسجيل:</p>
            <video 
              src={recordedVideo} 
              controls 
              className="w-full rounded-xl border border-[#8B9E6E]/20 max-h-48"
            />
          </div>
        )}

        {/* تنبيه */}
        <div className="text-xs text-[#8B9E6E]/60 p-3 bg-white/40 rounded-xl">
          💡 ملاحظات:
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>التسجيلات تُحفظ على جهازك فقط</li>
            <li>يمكنك اختيار تسجيل الشاشة أو نافذة محددة</li>
            <li>المدة الطويلة قد تنتج ملفات كبيرة الحجم</li>
            <li>يتم حفظ التسجيل تلقائياً بعد إيقافه</li>
          </ul>
        </div>
      </div>
    </div>
  );
            }
