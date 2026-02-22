import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  selected?: boolean;
  icon?: ReactNode;
  onChange?: (selected: boolean) => void;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      selected = false,
      icon,
      onChange,
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onChange?.(!selected);
      onClick?.(e);
    };

    const classes = [
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
      'transition-all duration-150 cursor-pointer select-none',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
      selected
        ? 'bg-blue-500 text-white shadow-sm focus-visible:ring-blue-400'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus-visible:ring-gray-400',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={selected}
        className={classes}
        onClick={handleClick}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

Chip.displayName = 'Chip';

export interface ChipGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function ChipGroup({ label, children, className = '' }: ChipGroupProps) {
  return (
    <div className={className} role="group" aria-label={label}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default Chip;
