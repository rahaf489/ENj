"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  const [sessions, setSessions] = useState(0);
  const [distractions, setDistractions] = useState(0);

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);

  // تحميل البيانات
  useEffect(() => {
    setSessions(Number(localStorage.getItem("sessions") || 0));
    setDistractions(Number(localStorage.getItem("distractions") || 0));
    setTasks(JSON.parse(localStorage.getItem("tasks") || "[]"));
  }, []);

  // حفظ البيانات
  useEffect(() => {
    localStorage.setItem("sessions", String(sessions));
    localStorage.setItem("distractions", String(distractions));
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [sessions, distractions, tasks]);

  // المؤقت
  useEffect(() => {
    let t: any;
    if (running) {
      t = setInterval(() => setTime((p) => p + 1), 1000);
    }
    return () => clearInterval(t);
  }, [running]);

  const format = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const focusScore = () => {
    return Math.max(0, sessions * 10 + time / 60 - distractions * 5);
  };

  const advice = () => {
    const s = focusScore();
    if (s < 20) return "تركيز ضعيف: اشتغلي 15 دقيقة فقط + راحة.";
    if (s < 50) return "تركيز متوسط: قسّمي الدراسة.";
    return "تركيز ممتاز: تقدري تدرسي مواد صعبة الآن.";
  };

  const addTask = () => {
    if (!task) return;
    setTasks([...tasks, task]);
    setTask("");
  };

  const endSession = () => {
    setRunning(false);
    setSessions((s) => s + 1);
    setTime(0);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>إنجاز</h1>

        <div style={styles.timer}>{format(time)}</div>

        <div>
          <button onClick={() => setRunning(true)}>ابدأ</button>
          <button onClick={() => setRunning(false)}>إيقاف</button>
          <button onClick={endSession}>إنهاء</button>
        </div>

        <p>جلسات: {sessions}</p>
        <p>تشتت: {distractions}</p>

        <button onClick={() => setDistractions((d) => d + 1)}>
          تسجيل تشتت
        </button>

        <hr />

        <h3>المهام</h3>

        <input value={task} onChange={(e) => setTask(e.target.value)} />
        <button onClick={addTask}>إضافة</button>

        <ul>
          {tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>

        <hr />

        <h3>تحليل يومك</h3>
        <p>مؤشر التركيز: {focusScore().toFixed(1)}</p>
        <p>{advice()}</p>

        {/* رسم بسيط */}
        <div style={styles.bar}>
          <div
            style={{
              width: `${Math.min(focusScore(), 100)}%`,
              height: "10px",
              background: "limegreen",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "sans-serif",
  },
  card: {
    width: "400px",
    padding: "20px",
    borderRadius: "12px",
    background: "#111827",
  },
  timer: {
    fontSize: "40px",
    margin: "10px 0",
  },
  bar: {
    width: "100%",
    height: "10px",
    background: "#333",
    marginTop: "10px",
  },
};
