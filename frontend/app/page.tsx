'use client';
import { useState, useEffect } from 'react';
import React from 'react';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState([] as string[]);

  const decompose = async () => {
    const res = await fetch('/api/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: goal, user_context: '', selected_options: [] }),
    });
    const data = await res.json();
    setTasks(data.sub_problems);
    localStorage.setItem('tasks', JSON.stringify(data.sub_problems));
  };

  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">ExploreLLM</h1>
      <textarea
        className="w-full p-2 border"
        placeholder="Enter main goal..."
        value={goal}
        onChange={e => setGoal(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={decompose}
      >
        Decompose
      </button>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((t, i) => (
          <a
            key={i}
            href={`/${encodeURIComponent(t)}`}
            className="p-4 border rounded hover:shadow-lg"
          >
            {t}
          </a>
        ))}
      </div>
    </div>
  );
}