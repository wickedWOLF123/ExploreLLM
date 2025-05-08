'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState([] as string[]);
  const [personalization, setPersonalization] = useState('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedPersonal = localStorage.getItem('personalization');
    if (savedPersonal) setPersonalization(savedPersonal);
  }, []);

  const decompose = async () => {
    if (!goal.trim()) return; // no empty calls

    // Persist personalization
    localStorage.setItem('personalization', personalization);

    const res = await fetch('/api/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: goal,
        user_context: personalization,
        selected_options: [],
      }),
    });
    const data = await res.json();
    setTasks(data.sub_problems);
    localStorage.setItem('tasks', JSON.stringify(data.sub_problems));
  };

  const summarize = async () => {
    if (!personalization) {
      alert('Please add some personalization information first');
      return;
    }
    
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: goal || 'My travel preferences',
        user_context: personalization,
        selected_options: [],
      }),
    });
    const data = await res.json();
    setSummary(data.summary);
  };

  const resetEverything = () => {
    // Clear localStorage
    localStorage.removeItem('tasks');
    localStorage.removeItem('personalization');
    
    // Reset all state variables
    setGoal('');
    setTasks([]);
    setPersonalization('');
    setSummary('');
    
    // Confirm to the user
    alert('All data cleared! You can start fresh now.');
  };

  return (
    <div style={{ 
      backgroundColor: '#f0f4ff', 
      minHeight: '100vh', 
      padding: '40px 20px',
      backgroundImage: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        width: '100%',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Header */}
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1a237e',
          marginBottom: '20px',
          textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
        }}>
          Ask a question to start the brainstorm
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: '#333',
          marginBottom: '30px' 
        }}>
          Enter your goal below and we'll help break it down into manageable steps.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <button
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '12px 25px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
            onClick={resetEverything}
          >
            ↺ Start Fresh (Clear All Data)
          </button>
        </div>

        {/* Main input section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '30px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <textarea
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: '2px solid #8ec5fc',
              fontSize: '18px',
              marginBottom: '20px',
              minHeight: '100px'
            }}
            placeholder="Enter your main goal..."
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              style={{
                backgroundColor: '#4a6bff',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                transform: 'translateY(0)',
                transition: 'all 0.2s ease'
              }}
              onClick={decompose}
            >
              {tasks.length > 0 ? 'Update ideas' : 'Generate ideas'}
            </button>
          </div>
        </div>

        {/* Task cards */}
        {tasks.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#1a237e',
              marginBottom: '25px' 
            }}>
              Your action items:
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {tasks.map(t => (
                <Link href={`/task/${encodeURIComponent(t)}`} key={t} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: '#ffcce6',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: '2px solid #ff66b3',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}>
                    <span style={{
                      color: '#333',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>{t}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Personalization section */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '30px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: '#1a237e',
            marginBottom: '20px' 
          }}>
            Tell us about yourself to get better recommendations
          </h2>
          <textarea
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: '2px solid #8ec5fc',
              fontSize: '18px',
              marginBottom: '20px',
              minHeight: '100px'
            }}
            placeholder="E.g. I like warm weather"
            value={personalization}
            onChange={e => setPersonalization(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button
              style={{
                backgroundColor: '#00c853',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
              onClick={decompose}
            >
              Re-generate ideas
            </button>
            
            <button
              style={{
                backgroundColor: '#ff6d00',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
              onClick={summarize}
            >
              Summarize My Preferences
            </button>
          </div>
        </div>

        {/* Summary section */}
        {summary && (
          <div style={{ 
            backgroundColor: '#FFF9C4',
            borderRadius: '16px',
            padding: '30px', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            marginTop: '40px',
            border: '2px solid #FFD600'
          }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold',
              color: '#7A501E',
              marginBottom: '20px' 
            }}>
              Your Personalized Summary
            </h2>
            <p style={{ 
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#333',
              textAlign: 'left'
            }}>
              {summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}