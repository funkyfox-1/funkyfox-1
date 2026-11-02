import * as React from 'react';
import { Link } from 'react-router-dom';
import './TactileOrderButton.css';

export interface TactileOrderButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  to?: string;
  variant?: 'default' | 'ink';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}

export default function TactileOrderButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  to,
  variant = 'default',
  icon,
  style,
  fullWidth = false,
}: TactileOrderButtonProps) {
  const variantClass = variant === 'ink' ? 'tactile-order-btn--ink' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  if (to && !disabled) {
    return (
      <div className={`tactile-order-btn-wrapper ${widthClass}`}>
        <Link
          to={to}
          onClick={onClick}
          className={`tactile-order-btn ${variantClass} ${widthClass} ${className}`}
          style={style}
        >
          {icon}
          <span>{children}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`tactile-order-btn-wrapper ${widthClass}`}>
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`tactile-order-btn ${variantClass} ${widthClass} ${className}`}
        style={style}
      >
        {icon}
        <span>{children}</span>
      </button>
    </div>
  );
}

