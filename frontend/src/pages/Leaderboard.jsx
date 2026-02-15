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
        <div className="leaderboard-page container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
                    <button
                        onClick={() => setView('global')}
                        style={{ padding: '8px 16px', borderRadius: '99px', background: view === 'global' ? 'white' : 'transparent', color: view === 'global' ? 'black' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}
                    >
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Globe size={14} /> global
                        </div>
                    </button>
                    <button
                        onClick={() => setView('city')}
                        style={{ padding: '8px 16px', borderRadius: '99px', background: view === 'city' ? 'white' : 'transparent', color: view === 'city' ? 'black' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}
                    >
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <MapPin size={14} /> city
                        </div>
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            ) : entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                    <Trophy size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>no data yet. be the first!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {entries.map((user, index) => (
                        <motion.div
                            key={user.handle || index}
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
                                    #{user.rank || index + 1}
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
                                    {(user.aura_score || user.aura || 0).toLocaleString()}
                                </span>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
