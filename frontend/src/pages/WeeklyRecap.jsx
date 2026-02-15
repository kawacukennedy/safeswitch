import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Share2, TrendingUp, Activity, Crosshair } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const WeeklyRecap = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [recap, setRecap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecap = async () => {
            try {
                // Get current user ID first
                const user = await api.getMe();
                if (user && user.id) {
                    const data = await api.getRecap(user.id);
                    setRecap(data);
                }
            } catch (err) {
                console.error(err);
                showToast({ message: 'Failed to load recap', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchRecap();
    }, [showToast]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-black">
                <div className="loader text-neon-green" />
            </div>
        );
    }

    if (!recap) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black text-white p-6">
                <p className="text-neutral-400 mb-4">No recap data available yet.</p>
                <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10"
                >
                    Return to Profile
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-green/10 blur-[100px] pointer-events-none" />

            <button
                onClick={() => navigate('/profile')}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 z-20"
            >
                <X size={24} />
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 mb-8"
            >
                <h1 className="text-4xl font-black italic tracking-tighter mb-2">WEEKLY<br />REPORT</h1>
                <p className="text-neon-green font-mono text-sm tracking-widest">
                    /// SYSTEM_ANALYSIS_COMPLETE
                </p>
            </motion.div>

            <div className="grid gap-4">
                {/* Total Glitches */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 border-l-4 border-neon-green"
                >
                    <div className="flex items-center gap-3 mb-2 text-white/60">
                        <Activity size={18} />
                        <span className="text-xs font-bold tracking-widest uppercase">Glitches Found</span>
                    </div>
                    <div className="text-4xl font-black">{recap.total_glitches}</div>
                </motion.div>

                {/* Aura Gained */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 border-l-4 border-neon-purple"
                >
                    <div className="flex items-center gap-3 mb-2 text-white/60">
                        <TrendingUp size={18} />
                        <span className="text-xs font-bold tracking-widest uppercase">Aura Gained</span>
                    </div>
                    <div className="text-4xl font-black text-neon-purple">+{recap.aura_change}</div>
                </motion.div>

                {/* Audit Accuracy */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 flex justify-between items-center"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-1 text-white/60">
                            <Crosshair size={18} />
                            <span className="text-xs font-bold tracking-widest uppercase">Audit Accuracy</span>
                        </div>
                        <div className="text-2xl font-bold">{recap.audit_accuracy}%</div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin-slow" />
                        <span className="text-xs font-bold">A+</span>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12"
            >
                <div className="text-center mb-6">
                    <p className="text-white/40 text-xs font-mono mb-2">MOST CHAOTIC DAY</p>
                    <p className="text-2xl font-black tracking-widest uppercase">{recap.most_chaotic_day}</p>
                </div>

                <button className="w-full py-4 rounded-xl bg-white text-black font-black text-lg flex items-center justify-center gap-2 hover:bg-neon-green transition-colors">
                    <Share2 size={20} />
                    SHARE REPORT
                </button>
            </motion.div>
        </div>
    );
};

export default WeeklyRecap;
