import React from 'react';
import clsx from 'clsx';
import './Input.css';

export const Input = ({
    label,
    error,
    className,
    id,
    type = 'text',
    ...props
}) => {
    return (
        <div className={clsx('input-wrapper', className)}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                id={id}
                type={type}
                className={clsx(
                    'input-field',
                    'glass-panel',
                    { 'input-error': error }
                )}
                {...props}
            />
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};
