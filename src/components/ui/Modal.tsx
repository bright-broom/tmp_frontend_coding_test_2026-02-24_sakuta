'use client';

import {
  forwardRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

export interface ModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
};

export function Modal({
  isOpen,
  onClose,
  size = 'md',
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = '',
}: ModalProps) {
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div
      ref={focusTrapRef}
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden
          animate-slide-in-up ${sizeStyles[size]} ${className}
        `}
      >
        {title && (
          <ModalHeader title={title} showCloseButton onClose={onClose} />
        )}

        <div className="overflow-y-auto max-h-[calc(85vh-8rem)] p-6">
          {children}
        </div>

        {footer && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, showCloseButton = true, onClose, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          sticky top-0 bg-white border-b border-gray-100 px-6 py-4
          flex items-start justify-between gap-4 ${className}
        `}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h2 id="modal-title" className="text-xl font-bold text-gray-900 truncate">
              {title}
            </h2>
          )}
          {children}
        </div>

        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="閉じる"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export default Modal;
