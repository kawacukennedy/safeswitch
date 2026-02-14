import React from 'react';
import { AlertOctagon } from 'lucide-react';

const Maintenance = () => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', background: 'black', color: 'white' }}>
            <AlertOctagon size={48} style={{ color: 'var(--color-aura-negative)', marginBottom: '24px' }} />
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>system offline</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
                glitch is currently undergoing maintenance. <br />
                estimated return: 2 hours.
            </p>
        </div>
    );
};

export default Maintenance;
