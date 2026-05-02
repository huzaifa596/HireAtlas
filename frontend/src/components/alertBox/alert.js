import { useState, useCallback } from "react";

export function useAlert() {
  const [alert, setAlert] = useState({ isOpen: false });

  const showAlert = useCallback((options) => {
    setAlert({ isOpen: true, ...options });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert({ isOpen: false });
  }, []);

  return { alert, showAlert, closeAlert };
}
