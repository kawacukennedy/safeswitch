import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => {
    return (
        <div className={clsx('glass-card', className)} style={{ padding: 'var(--spacing-md)' }} {...props}>
            {children}
        </div>
    );
};
