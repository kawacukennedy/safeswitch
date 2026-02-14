import React from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';

const MOCK_REPORTS = [
    { id: 1, date: '2026-01-20', reason: 'slop', status: 'resolved', video: '/mock.mp4' },
];

const ReportStatus = () => {
    return (
        <div className="report-status-page min-h-screen">
            <Header title="report status" showBack />
            <main className="container" style={{ marginTop: '20px' }}>
                {MOCK_REPORTS.map(report => (
                    <Card key={report.id} style={{ display: 'flex', gap: '12px', padding: '12px' }}>
                        <div style={{ width: '60px', height: '60px', background: '#333', borderRadius: '8px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '500' }}>{report.reason}</span>
                                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>{report.status}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                submitted {report.date}
                            </div>
                        </div>
                    </Card>
                ))}
            </main>
        </div>
    );
};

export default ReportStatus;
