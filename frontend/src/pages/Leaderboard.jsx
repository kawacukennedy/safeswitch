import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Trophy, MapPin, Globe, Loader2 } from 'lucide-react';
import { api } from '../api/client';

const Leaderboard = () => {
    const [view, setView] = useState('global'); // 'global' or 'city'
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getLeaderboard(view)
            .then(data => {
                setEntries(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Leaderboard fetch error:', err);
                setEntries([]);
                setLoading(false);
            });
    }, [view]);

    return (
        <div className="leaderboard-page container min-h-screen pt-20 pb-24 px-4 bg-black">
            <div className="flex flex-col items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/20 to-transparent blur-3xl pointer-events-none" />

                <h1 className="text-4xl font-black text-white italic tracking-tighter mb-6 relative z-10 text-center">
                    TOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">GLITCHERS</span>
                </h1>

                <div className="flex background-blur-md bg-white/5 p-1 rounded-full border border-white/10 relative z-10">
                    <button
                        onClick={() => setView('global')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all",
                            view === 'global' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                        )}
                    >
                        GLOBAL
                    </button>
                    <button
                        onClick={() => setView('city')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-xs font-bold tracking-widest transition-all",
                            view === 'city' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                        )}
                    >
                        LOCAL
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center padding-20">
                    <Loader2 size={32} className="text-neon-purple animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-20 text-white/40 flex flex-col items-center">
                    <Trophy size={48} className="mb-4 opacity-20" />
                    <p className="font-mono text-sm">NO DATA DETECTED</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 max-w-md mx-auto relative z-10">
                    {entries.map((user, index) => (
                        <motion.div
                            key={user.handle || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={clsx(
                                "flex items-center p-4 border transition-all hover:scale-[1.02]",
                                index === 0 ? "bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]" :
                                    index === 1 ? "bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/50" :
                                        index === 2 ? "bg-gradient-to-r from-orange-700/20 to-transparent border-orange-700/50" :
                                            "glass-panel border-white/5 bg-white/5"
                            )}>
                                <div className={clsx(
                                    "w-8 text-xl font-black italic mr-4 text-center",
                                    index === 0 ? "text-yellow-500" :
                                        index === 1 ? "text-gray-400" :
                                            index === 2 ? "text-orange-500" :
                                                "text-white/30"
                                )}>
                                    #{user.rank || index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-bold text-lg truncate">@{user.handle}</div>
                                    <div className="text-xs text-white/40 uppercase tracking-wider font-mono">
                                        Level {Math.floor((user.aura_score || 0) / 1000) + 1}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-mono text-lg font-bold text-neon-purple text-glow-purple">
                                        {(user.aura_score || user.aura || 0).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-neon-purple/60 tracking-widest">AURA</div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
