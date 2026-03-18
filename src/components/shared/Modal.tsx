import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        border: "1px solid #444",
        borderRadius: 8,
        padding: 20,
        backgroundColor: "#2a2a3e",
        color: "#eee",
        maxWidth: 400,
        width: "90%",
      }}
    >
      <h2 style={{ margin: "0 0 16px" }}>{title}</h2>
      {children}
    </dialog>
  );
}
