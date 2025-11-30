import React from 'react';
import './DiabloButton.css';

interface DiabloButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'success';
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function DiabloButton({
  children,
  onClick,
  variant = 'primary',
  icon,
  active = false,
  disabled = false,
  className = '',
}: DiabloButtonProps) {
  return (
    <button
      className={`diablo-button ${variant} ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </button>
  );
}
