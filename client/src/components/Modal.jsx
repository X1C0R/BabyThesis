    import React from "react";

const Modal = ({ isOpen, onClose, title, message, type = "info", onConfirm }) => {
  if (!isOpen) return null;

  const typeStyles = {
    success: {
      icon: "✅",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      textColor: "text-green-700",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    error: {
      icon: "❌",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      textColor: "text-red-700",
      buttonColor: "bg-red-600 hover:bg-red-700"
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-700",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700"
    },
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`${styles.bgColor} rounded-2xl shadow-2xl border-2 ${styles.borderColor} max-w-md w-full overflow-hidden animate-scale-in`}>
        {/* Header */}
        <div className={`p-6 ${styles.bgColor} border-b-2 ${styles.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{styles.icon}</span>
              <h3 className={`text-2xl font-bold ${styles.textColor}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          <p className="text-gray-700 text-lg leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-end space-x-3">
          {type === "error" && onConfirm && (
            <button
              onClick={handleConfirm}
              className={`px-6 py-3 rounded-xl text-white font-semibold ${styles.buttonColor} transition-all hover:scale-105 shadow-lg`}
            >
              Retry
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-3 rounded-xl text-white font-semibold ${styles.buttonColor} transition-all hover:scale-105 shadow-lg`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

