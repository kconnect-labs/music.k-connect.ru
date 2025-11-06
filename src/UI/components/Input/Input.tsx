import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClasses = [
    'ui-input',
    error && 'ui-input--error',
    fullWidth && 'ui-input--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`ui-input-wrapper ${fullWidth ? 'ui-input-wrapper--full-width' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
      {error && (
        <span className="ui-input-error" role="alert">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span className="ui-input-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;

