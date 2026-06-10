import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          minWidth: "400px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2>{title}</h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default Modal;