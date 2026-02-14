import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import './Header.css';

export const Header = ({ title, showBack, rightAction }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Show back button only if explicitly requested or if not on root/tab pages (optional logic)
    // For this app, we might want explicit control.

    return (
        <header className="app-header glass-panel">
            <div className="header-left">
                {showBack && (
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ChevronLeft size={24} />
                    </button>
                )}
            </div>
            <div className="header-center">
                <h1 className="header-title">{title || 'glitch'}</h1>
            </div>
            <div className="header-right">
                {rightAction}
            </div>
        </header>
    );
};
