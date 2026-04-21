import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Button({ children, onClick, variant = 'primary', disabled = false, loading = false, type = 'button', style = {}, className = '' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn btn-${variant} ${className}`}
            style={{
                opacity: (disabled || loading) ? 0.7 : 1,
                cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
                ...style
            }}
        >
            {loading ? <><Loader2 size={18} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />Loading...</> : children}
        </button>
    )
}
