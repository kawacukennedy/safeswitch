import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { api } from '../../api/client';
import { Loader2 } from 'lucide-react';

const AuraChart = ({ data }) => {
    const width = 320;
    const height = 160;
    const padding = 20;

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        // Build running total from deltas (newest first, so reverse)
        const reversed = [...data].reverse();
        let running = 0;
        const points = reversed.map((entry, i) => {
            running += (entry.delta || 0);
            return { x: i, y: running, date: entry.created_at };
        });

        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        const rangeY = maxY - minY || 1;
        const rangeX = points.length - 1 || 1;

        // Scale to SVG coordinates
        const scaled = points.map(p => ({
            x: padding + ((p.x / rangeX) * (width - padding * 2)),
            y: padding + ((1 - (p.y - minY) / rangeY) * (height - padding * 2)),
            value: p.y
        }));

        return { scaled, minY, maxY };
    }, [data]);

    if (!chartData) {
        return (
            <Card style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                no chart data yet
            </Card>
        );
    }

    const { scaled, minY, maxY } = chartData;

    // Build SVG path
    const pathD = scaled.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    // Build gradient area path
    const areaD = `${pathD} L ${scaled[scaled.length - 1].x} ${height - padding} L ${scaled[0].x} ${height - padding} Z`;

    const lastPoint = scaled[scaled.length - 1];
    const isPositive = lastPoint.value >= 0;

    return (
        <Card style={{ padding: '16px' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                <defs>
                    <linearGradient id="auraGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? 'rgba(124, 255, 178, 0.3)' : 'rgba(255, 107, 107, 0.3)'} />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path d={areaD} fill="url(#auraGradient)" />

                {/* Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={isPositive ? 'var(--color-aura-positive)' : 'var(--color-aura-negative)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Current value dot */}
                <circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r="4"
                    fill={isPositive ? 'var(--color-aura-positive)' : 'var(--color-aura-negative)'}
                />

                {/* Labels */}
                <text x={padding} y={padding - 4} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace">
                    {maxY > 0 ? '+' : ''}{maxY}
                </text>
                <text x={padding} y={height - padding + 14} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace">
                    {minY > 0 ? '+' : ''}{minY}
                </text>
            </svg>
        </Card>
    );
};

const AuraHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAuraHistory()
            .then(data => {
                setHistory(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh' }}>
                <Header title="aura log" showBack />
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="aura-history-page" style={{ minHeight: '100vh' }}>
            <Header title="aura log" showBack />
            <main className="container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Chart */}
                <AuraChart data={history} />

                <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '12px', paddingLeft: '4px' }}>recent activity</h3>

                {history.length === 0 && <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No history yet.</div>}

                {history.map((log, i) => (
                    <Card key={log.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                        <div>
                            <div style={{ fontSize: '16px' }}>{log.reason?.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                {new Date(log.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '500', color: (log.delta > 0) ? 'var(--color-aura-positive)' : 'var(--color-aura-negative)' }}>
                            {log.delta > 0 ? '+' : ''}{log.delta}
                        </div>
                    </Card>
                ))}
            </main>
        </div>
    );
};

export default AuraHistory;
