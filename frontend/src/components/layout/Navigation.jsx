import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Activity, Trophy, User } from 'lucide-react';
import clsx from 'clsx';


const navItems = [
    { path: '/daily-glitch', icon: Zap, label: 'glitch' },
    { path: '/feed', icon: Activity, label: 'feed' },
    { path: '/leaderboard', icon: Trophy, label: 'top' },
    { path: '/profile', icon: User, label: 'you' },
];

export const Navigation = () => {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[280px]">
            <div className="glass-panel rounded-full px-6 py-4 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-white/10 backdrop-blur-xl bg-black/60">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => clsx(
                            "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                            isActive ? "text-neon-green" : "text-white/40 hover:text-white/80"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={clsx(
                                    "absolute inset-0 rounded-full blur-md bg-neon-green/20 transition-opacity duration-300",
                                    isActive ? "opacity-100" : "opacity-0"
                                )} />
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-neon-green shadow-[0_0_8px_currentColor]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
