import { useEffect, useState } from 'react'
import type { HealthResponse } from '@hush/shared'

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/health')
      .then((res) => res.json() as Promise<HealthResponse>)
      .then(setHealth)
      .catch(() => setError('API unreachable'))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>Hush</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Tiens le silence le plus longtemps possible.</p>
      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '16px 20px' }}>
        <h2 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, color: '#888', margin: '0 0 12px' }}>Status API</h2>
        {error && <p style={{ color: '#e53e3e' }}>{error}</p>}
        {health && (
          <>
            <p style={{ margin: '4px 0' }}>
              <span style={{ color: '#888' }}>status : </span>
              <strong>{health.status}</strong>
            </p>
            <p style={{ margin: '4px 0' }}>
              <span style={{ color: '#888' }}>db : </span>
              <strong style={{ color: health.db === 'connected' ? '#38a169' : '#e53e3e' }}>{health.db}</strong>
            </p>
            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#aaa' }}>{health.timestamp}</p>
          </>
        )}
        {!health && !error && <p style={{ color: '#aaa' }}>Chargement…</p>}
      </div>
    </div>
  )
}

export default App
