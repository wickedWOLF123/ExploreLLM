'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import React from 'react';


export default function TaskPage() {
  const params = useSearchParams();
  const task = params.get('taskId') || '';
  const [opts, setOpts] = useState([] as string[]);
  const [rec, setRec] = useState('');
  const [checked, setChecked] = useState([] as boolean[]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      const res = await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: task, context: '', user_context: '', selected_options: [] }),
      });
      const data = await res.json();
      setRec(data.recommended);
      setOpts(data.options);
      setChecked(new Array(data.options.length).fill(false));
    };
    fetchOptions();
  }, [task]);

  const toggle = (i: number) => {
    const c = [...checked]; c[i] = !c[i]; setChecked(c);
    localStorage.setItem('selected', JSON.stringify(c));
  };

  const summarize = async () => {
    const selectedOpts = opts.filter((_, i) => checked[i]);
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: task, user_context: '', selected_options: selectedOpts }),
    });
    const data = await res.json();
    setSummary(data.summary);
    localStorage.setItem('summary', data.summary);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg mb-2">{task}</h2>
      <p className="italic mb-4">Recommended: {rec}</p>
      <div className="space-y-2 mb-4">
        {opts.map((o, i) => (
          <label key={i} className="flex items-center">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="mr-2"
            />
            {o}
          </label>
        ))}
      </div>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded"
        onClick={summarize}
      >
        Summarize
      </button>
      {summary && <p className="mt-4 border p-2">{summary}</p>}
    </div>
  );
}