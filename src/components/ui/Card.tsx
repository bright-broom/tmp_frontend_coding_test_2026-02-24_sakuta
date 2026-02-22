import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white rounded-xl shadow-md border border-gray-100',
  elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
  outlined: 'bg-white rounded-xl border-2 border-gray-200',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', noPadding = false, className = '', children, ...props }, ref) => {
    const classes = [
      variantStyles[variant],
      noPadding ? '' : 'p-4',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between gap-4 ${className}`}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ noPadding = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${noPadding ? '' : 'mt-4'} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ withBorder = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 ${withBorder ? 'pt-4 border-t border-gray-100' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
