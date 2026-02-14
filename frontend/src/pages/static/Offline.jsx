import React from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const Offline = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center animate-pulse-slow">
                <WifiOff className="w-12 h-12 text-white/50" />
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight lowercase">offline</h1>
                <p className="text-white/50 text-sm lowercase">
                    you're disconnected from the simulation.
                    <br />
                    check your connection.
                </p>
            </div>

            <Button onClick={handleRetry} className="w-full max-w-xs">
                retry connection
            </Button>
        </div>
    );
};

export default Offline;
