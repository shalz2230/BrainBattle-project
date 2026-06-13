import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: '', visible: false });

  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  const ToastEl = (
    <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>
      {toast.msg}
    </div>
  );

  return { showToast, ToastEl };
}
