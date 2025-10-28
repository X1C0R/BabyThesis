// Modal utility to show custom alerts
export const showModal = ({ 
  title, 
  message, 
  type = "info", 
  onConfirm, 
  onCancel,
  autoClose = null,
  showCancel = false 
}) => {
  // Create modal element
  const modal = document.createElement("div");
  modal.id = "custom-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
  modal.style.backdropFilter = "blur(4px)";
  modal.style.transition = "opacity 0.2s ease-out";

  let autoCloseTimeout = null;

  const typeStyles = {
    success: {
      icon: "✅",
      textColor: "text-gray-900",
      primaryButtonColor: "bg-blue-600 hover:bg-blue-700",
      secondaryButtonColor: "bg-gray-100 hover:bg-gray-200 text-gray-700"
    },
    error: {
      icon: "❌",
      textColor: "text-gray-900",
      primaryButtonColor: "bg-red-600 hover:bg-red-700",
      secondaryButtonColor: "bg-gray-100 hover:bg-gray-200 text-gray-700"
    },
    warning: {
      icon: "⚠️",
      textColor: "text-gray-900",
      primaryButtonColor: "bg-purple-600 hover:bg-purple-700",
      secondaryButtonColor: "bg-purple-100 hover:bg-purple-200"
    },
    info: {
      icon: "ℹ️",
      textColor: "text-gray-900",
      primaryButtonColor: "bg-blue-600 hover:bg-blue-700",
      secondaryButtonColor: "bg-gray-100 hover:bg-gray-200 text-gray-700"
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  const handleClose = () => {
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout);
    }
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === modal && !showCancel) {
      handleClose();
    }
  };

  modal.innerHTML = `
    <div id="modal-content" class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" style="transform: scale(0.9); opacity: 0; transition: all 0.2s ease-out;">
      <!-- Header with Gradient Background -->
      <div class="px-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold">${title}</h3>
          ${!showCancel ? `<button id="close-btn" class="text-white hover:text-gray-200 text-2xl font-bold transition-colors">×</button>` : ''}
        </div>
      </div>
      
      <!-- Body -->
      <div class="px-6 py-8">
        <div class="flex items-start space-x-4">
          <div class="text-5xl flex-shrink-0">${styles.icon}</div>
          <p class="text-gray-700 text-base leading-relaxed flex-1 mt-1">${message}</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
        ${showCancel ? `
          <button id="cancel-btn" class="px-8 py-3 rounded-xl font-semibold bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 transition-all hover:border-gray-400 hover:shadow-sm">
            Cancel
          </button>
          <button id="confirm-btn" class="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
            Confirm
          </button>
        ` : `
          <button id="ok-btn" class="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
            OK
          </button>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Trigger animation
  setTimeout(() => {
    const modalContent = modal.querySelector("#modal-content");
    if (modalContent) {
      modalContent.style.transform = "scale(1)";
      modalContent.style.opacity = "1";
    }
  }, 10);

  // Auto-close if specified
  if (autoClose && !showCancel) {
    autoCloseTimeout = setTimeout(() => {
      handleClose();
    }, autoClose);
  }

  // Attach event listeners
  modal.addEventListener("click", handleBackdropClick);
  
  const closeBtn = modal.querySelector("#close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", handleClose);
  }
  
  const okBtn = modal.querySelector("#ok-btn");
  if (okBtn) {
    okBtn.addEventListener("click", handleConfirm);
  }
  
  const cancelBtn = modal.querySelector("#cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", handleCancel);
  }
  
  const confirmBtn = modal.querySelector("#confirm-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", handleConfirm);
  }

  return modal;
};

// Convenience functions
export const showSuccess = (message, title = "Success!", autoClose = 3000) => {
  return showModal({ title, message, type: "success", autoClose });
};

export const showError = (message, title = "Error!", autoClose = 4000) => {
  return showModal({ title, message, type: "error", autoClose });
};

export const showWarning = (message, title = "Warning!", autoClose = null) => {
  return showModal({ title, message, type: "warning", autoClose });
};

export const showInfo = (message, title = "Information", autoClose = 3000) => {
  return showModal({ title, message, type: "info", autoClose });
};

export const showConfirm = (message, onConfirm, onCancel = null, title = "Confirm") => {
  return showModal({ 
    title, 
    message, 
    type: "warning", 
    onConfirm, 
    onCancel,
    showCancel: true 
  });
};
