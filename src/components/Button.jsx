import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Button({ children, onClick, variant = 'primary', disabled = false, type = 'button', style = {}, className = '' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${className}`}
            style={{
                opacity: disabled ? 0.7 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                ...style
            }}
        >
            {disabled ? 'Loading...' : children}
        </button>
    )
}
