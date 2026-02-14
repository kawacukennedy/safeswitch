import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Trophy, MapPin, Globe } from 'lucide-react';

const MOCK_LEADERBOARD = [
    { rank: 1, handle: 'cipher_zero', aura: 12500 },
    { rank: 2, handle: 'neon_runner', aura: 11200 },
    { rank: 3, handle: 'ghost_01', aura: 9800 },
    { rank: 4, handle: 'glitch_witch', aura: 8500 },
    { rank: 5, handle: 'void_walker', aura: 7200 },
    { rank: 6, handle: 'pixel_dust', aura: 6900 },
    { rank: 7, handle: 'chrome_heart', aura: 5400 },
    { rank: 8, handle: 'data_drift', aura: 4300 },
];

const Leaderboard = () => {
    const [view, setView] = useState('global'); // 'global' or 'city'

    return (
        <div className="leaderboard-page container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
                    <button
                        onClick={() => setView('global')}
                        className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-all', {
                            'bg-white text-black': view === 'global',
                            'text-white/70': view !== 'global'
                        })}
                        style={{ padding: '8px 16px', borderRadius: '99px', background: view === 'global' ? 'white' : 'transparent', color: view === 'global' ? 'black' : 'rgba(255,255,255,0.7)' }}
                    >
                        <div className="flex-center gap-2" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Globe size={14} /> global
                        </div>
                    </button>
                    <button
                        onClick={() => setView('city')}
                        className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-all', {
                            'bg-white text-black': view === 'city',
                            'text-white/70': view !== 'city'
                        })}
                        style={{ padding: '8px 16px', borderRadius: '99px', background: view === 'city' ? 'white' : 'transparent', color: view === 'city' ? 'black' : 'rgba(255,255,255,0.7)' }}
                    >
                        <div className="flex-center gap-2" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <MapPin size={14} /> city
                        </div>
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MOCK_LEADERBOARD.map((user, index) => (
                    <motion.div
                        key={user.handle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                            <span style={{
                                width: '32px',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: index < 3 ? 'var(--color-aura-positive)' : 'var(--color-text-secondary)'
                            }}>
                                #{user.rank}
                            </span>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '16px', fontWeight: '500' }}>@{user.handle}</span>
                            </div>
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: '16px',
                                color: 'var(--color-aura-positive)',
                                textShadow: '0 0 10px rgba(124, 255, 178, 0.4)'
                            }}>
                                {user.aura.toLocaleString()}
                            </span>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
