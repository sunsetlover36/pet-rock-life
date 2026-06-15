import { useAtom } from "jotai";
import { modalVisibleAtom } from "~/store";
import { cn } from "~/config/utils";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export function Modal({ children, className, onClose }: ModalProps) {
  const [isVisible, setIsVisible] = useAtom(modalVisibleAtom);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "bg-white rounded-2xl p-6 max-w-[380px] w-full mx-4 max-h-[80vh] overflow-hidden",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
