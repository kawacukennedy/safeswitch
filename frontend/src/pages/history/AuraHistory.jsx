import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { api } from '../../api/client';

const AuraHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        api.getAuraHistory()
            .then(setHistory)
            .catch(console.error);
    }, []);

    return (
        <div className="aura-history-page min-h-screen">
            <Header title="aura log" showBack />
            <main className="container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Chart Placeholder */}
                <Card style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                    [Aura Chart Placeholder]
                </Card>

                <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '12px', paddingLeft: '4px' }}>recent activity</h3>

                {history.length === 0 && <div className="p-4 text-center text-white/50">No history yet.</div>}

                {history.map((log, i) => (
                    <Card key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                        <div>
                            <div style={{ fontSize: '16px' }}>{log.reason}</div>
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
