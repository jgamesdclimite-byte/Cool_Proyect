import { createContext, useCallback, useContext, useState } from 'react'
import { IconAlert, IconCheck } from './Icons.jsx'

const ToastCtx = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, tipo = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, msg, tipo }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.tipo}`}>
            {t.tipo === 'ok' ? <IconCheck /> : <IconAlert />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastCtx)
