import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Shield, Activity, FileText } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.getMe();
                setProfile(data);
            } catch (err) {
                showToast({ message: 'Failed to load profile', type: 'error' });
                // Fallback mock
                setProfile({
                    handle: 'guest_user',
                    aura_score: 0,
                    signals_count: 0,
                    audits_count: 0
                });
            }
        };
        fetchProfile();
    }, [showToast]);

    const stats = [
        { label: 'Signals', value: profile?.signals_count || 0 },
        { label: 'Audits', value: profile?.audits_count || 0 },
        { label: 'Rank', value: '#--' },
    ];

    if (!profile) return null;

    return (
        <div className="p-6 relative isolate max-w-md mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">PROFILE</h1>
                <button onClick={() => navigate('/settings')} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <Settings className="text-white" size={20} />
                </button>
            </div>

            {/* Profile Card */}
            <div className="glass-card p-6 mb-6 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-green to-blue-500 mb-4 p-1">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-2xl font-mono text-white">
                            {(profile.handle || 'U').substring(0, 2).toUpperCase()}
                        </span>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-1">@{profile.handle}</h2>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-neon-green font-mono">{profile.aura_score} AURA</span>
                    <Shield size={14} className="text-neon-green" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-8 w-full border-t border-white/10 pt-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                <button
                    onClick={() => navigate('/recap')}
                    className="w-full p-4 glass-panel flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Activity className="text-neon-pink" size={20} />
                        <span className="text-white">Weekly Recap</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                </button>

                <button
                    onClick={() => navigate('/history/aura')}
                    className="w-full p-4 glass-panel flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <FileText className="text-neon-blue" size={20} />
                        <span className="text-white">Aura History</span>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/history/audit')}
                    className="w-full p-4 glass-panel flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Shield className="text-neon-green" size={20} />
                        <span className="text-white">Audit History</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Profile;
