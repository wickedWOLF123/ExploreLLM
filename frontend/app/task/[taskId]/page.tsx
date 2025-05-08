'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TaskPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();

  const [rec, setRec] = useState('');
  const [opts, setOpts] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [personal, setPersonal] = useState('');

  // --------------------------------------------------
  // Load personalization & fetch options once
  // --------------------------------------------------
  useEffect(() => {
    const pers = localStorage.getItem('personalization') || '';
    setPersonal(pers);

    (async () => {
      const res = await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: taskId,
          user_context: pers,
          selected_options: [],
        }),
      });
      const data = await res.json();
      setRec(data.recommended || '');
      setOpts(data.options || []);
      setChecked(new Array((data.options || []).length).fill(false));
    })();
  }, [taskId]);

  const toggle = (i: number) =>
    setChecked(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });


  const updatePersonalizationAndGoBack = () => {
    // Get selected options
    const selected = opts.filter((_, i) => checked[i]);
    if (selected.length === 0) {
      router.push('/');
      return;
    }

    // Get current personalization
    const currentPersonalization = localStorage.getItem('personalization') || '';
    
    // Add selected options to personalization
    let newPersonalization = currentPersonalization;
    if (currentPersonalization) {
      newPersonalization += '. ';
    }
    newPersonalization += `I like ${selected.join(' and ')}`;
    
    // Save updated personalization
    localStorage.setItem('personalization', newPersonalization);
    
    // Navigate back to home
    router.push('/');
  };

  return (
    <div style={{ 
      backgroundColor: '#f0f4ff', 
      minHeight: '100vh', 
      padding: '40px 20px',
      backgroundImage: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Back button */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#4a6bff',
            fontWeight: 'bold',
            fontSize: '16px',
            textDecoration: 'none'
          }}>
            ← Back to ideas
          </Link>
        </div>

        {/* Title */}
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#1a237e',
          marginBottom: '30px',
          textAlign: 'center',
          maxWidth: '700px'
        }}>
          {decodeURIComponent(taskId as string)}
        </h1>

        {/* Recommended Panel */}
        {rec && (
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            borderLeft: '8px solid #2196f3',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1565c0',
              marginBottom: '15px'
            }}>
              Recommended
            </h2>
            <p style={{ 
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#333'
            }}>
              {rec}
            </p>
          </div>
        )}

        {/* Options Panel */}
        {opts.length > 0 && (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1a237e',
              marginBottom: '20px'
            }}>
              Other Options
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {opts.map((o, i) => (
                <label key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: checked[i] ? '#f0f7ff' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    checked={checked[i] || false}
                    onChange={() => toggle(i)}
                    style={{ 
                      width: '20px',
                      height: '20px',
                      marginTop: '4px',
                      accentColor: '#4a6bff'
                    }}
                  />
                  <span style={{ 
                    fontSize: '16px',
                    lineHeight: '1.5',
                    color: '#333'
                  }}>
                    {o}
                  </span>
                </label>
              ))}
            </div>

            {/* Add a "Save & Go Back" button */}
            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={updatePersonalizationAndGoBack}
                style={{
                  backgroundColor: '#7e57c2',
                  color: 'white',
                  padding: '12px 25px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                Save Selections & Explore More Ideas
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 