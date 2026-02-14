import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Activity, Trophy, User } from 'lucide-react';
import clsx from 'clsx';
import './Navigation.css';

const navItems = [
    { path: '/daily-glitch', icon: Zap, label: 'glitch' },
    { path: '/feed', icon: Activity, label: 'feed' },
    { path: '/leaderboard', icon: Trophy, label: 'top' },
    { path: '/profile', icon: User, label: 'you' },
];

export const Navigation = () => {
    return (
        <nav className="nav-bar glass-panel">
            {navItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => clsx('nav-item', { 'active': isActive })}
                >
                    <Icon size={24} strokeWidth={1.5} />
                    {/* <span className="nav-label">{label}</span> */}
                </NavLink>
            ))}
        </nav>
    );
};
