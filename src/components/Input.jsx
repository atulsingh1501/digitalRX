import React from 'react'

export default function Input({ label, type = "text", value, onChange, placeholder, required = false, maxLength, className = "", name }) {
    return (
        <div className={`input-group ${className}`} style={{ marginBottom: '16px' }}>
            {label && <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>{label}</label>}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
            />
        </div>
    )
}
