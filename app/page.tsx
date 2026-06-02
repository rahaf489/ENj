"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  text: string;
  done: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  const [sessions, setSessions] = useState(0);
  const [distractions, setDistractions] = useState(0);

  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  // load
  useEffect(() => {
    const t = localStorage.getItem("tasks");
    const s = localStorage.getItem("sessions");
    const d = localStorage.getItem("distractions");

    if (t) setTasks(JSON.parse(t));
    if (s) setSessions(Number(s));
    if (d) setDistractions(Number(d));
  }, []);

  // save
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("sessions", String(sessions));
    localStorage.setItem("distractions", String(distractions));
  }, [tasks, sessions, distractions]);

  // timer
  useEffect(() => {
    let i: any;
    if (running) i = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [running]);

  const addTask = () => {
    if (!input.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      text: input,
      done: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setInput("");
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const start = () => setRunning(true);
  const pause = () => setRunning(false);

  const end = () => {
    setRunning(false);
    setSessions((s) => s + 1);
    setTime(0);
  };

  const addDistraction = () => {
    setDistractions((d) => d + 1);
  };

  const format = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const doneTasks = tasks.filter((t) => t.done).length;

  return (
    <main className="page">
      <div className="container">

        {/* HEADER */}
        <h1>إنجاز</h1>

        {/* TIMER */}
        <div className="card">
          <div className="time">{format(time)}</div>

          <div className="row">
            <button onClick={start}>ابدأ</button>
            <button onClick={pause}>إيقاف</button>
            <button onClick={end}>إنهاء</button>
          </div>
        </div>

        {/* TASKS */}
        <div className="card">
          <h3>المهام</h3>

          <div className="inputRow">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="أضف مهمة..."
            />
            <button onClick={addTask}>+</button>
          </div>

          {tasks.length === 0 ? (
            <p className="muted">لا توجد مهام</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="task">
                <span
                  onClick={() => toggleTask(t.id)}
                  style={{
                    textDecoration: t.done ? "line-through" : "none",
                    opacity: t.done ? 0.5 : 1,
                    cursor: "pointer",
                  }}
                >
                  {t.text}
                </span>

                <button onClick={() => removeTask(t.id)}>x</button>
              </div>
            ))
          )}
        </div>

        {/* STATS */}
        <div className="grid">
          <div className="mini">
            جلسات<br />{sessions}
          </div>

          <div className="mini">
            تشتت<br />{distractions}
          </div>

          <div className="mini">
            مهام<br />{doneTasks}/{tasks.length}
          </div>
        </div>

        <button onClick={addDistraction}>تسجيل تشتت</button>

      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 20px;
          background: #0b1220;
          color: white;
          font-family: system-ui;
        }

        .container {
          width: 420px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card {
          background: rgba(255,255,255,0.05);
          padding: 14px;
          border-radius: 14px;
        }

        .time {
          font-size: 48px;
          text-align: center;
        }

        .row {
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        button {
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.08);
          color: white;
          cursor: pointer;
        }

        .inputRow {
          display: flex;
          gap: 6px;
        }

        input {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.06);
          color: white;
        }

        .task {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }

        .mini {
          background: rgba(255,255,255,0.05);
          padding: 10px;
          border-radius: 10px;
          text-align: center;
        }

        .muted {
          opacity: 0.6;
          font-size: 12px;
        }
      `}</style>
    </main>
  );
}