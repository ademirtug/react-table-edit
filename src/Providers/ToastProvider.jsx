import React, { createContext, useContext, useState, useCallback } from "react";
import ReactDOM from "react-dom";

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", delay = 5000) => {
    if (type == "danger") {
      console.error(message);
    }

    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, delay);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {ReactDOM.createPortal(
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          {toasts.map(({ id, message, type }) => (
            <div
              key={id}
              className={`toast show text-bg-${type} border-0`}
              role="alert"
            >
              <div className="d-flex">
                <div className="toast-body">{message}</div>
                <button
                  type="button"
                  className="btn-close me-2 m-auto"
                  onClick={() =>
                    setToasts((prev) => prev.filter((t) => t.id !== id))
                  }
                ></button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
