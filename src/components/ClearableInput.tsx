import React, { useRef } from 'react'

interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export const ClearableInput: React.FC<ClearableInputProps> = ({
  className = '',
  value,
  onChange,
  onClear,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else if (onChange) {
      // Create a synthetic event if no onClear handler is provided
      const event = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>
      onChange(event)
    }

    inputRef.current?.focus()
  }

  // Check if input has value to decide whether to show clear button
  const hasValue = value !== '' && value !== undefined && value !== null

  return (
    <div className="input-wrapper">
      <input
        ref={inputRef}
        className={`${className} ${hasValue ? 'input-with-clear' : ''}`}
        value={value}
        onChange={onChange}
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          className="clear-btn"
          onClick={handleClear}
          aria-label="Clear input"
          tabIndex={-1}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  )
}
