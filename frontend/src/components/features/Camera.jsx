import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera as CameraIcon, VideoOff } from 'lucide-react';
import clsx from 'clsx';

export const Camera = forwardRef(({
    onStreamReady,
    onError,
    className
}, ref) => {
    const videoRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const streamRef = useRef(null);

    useImperativeHandle(ref, () => ({
        start: startCamera,
        stop: stopCamera,
        video: videoRef.current
    }));

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setHasPermission(true);
                if (onStreamReady) onStreamReady(stream);
            }
        } catch (err) {
            console.error("Camera error:", err);
            setHasPermission(false);
            if (onError) onError(err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className={clsx('relative bg-black rounded-lg overflow-hidden', className)} style={{ aspectRatio: '9/16' }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {hasPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-gray-900" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <VideoOff size={48} className="mb-2" style={{ marginBottom: '8px' }} />
                    <span>Camera permission denied</span>
                </div>
            )}

            {hasPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="loader" />
                </div>
            )}
        </div>
    );
});

Camera.displayName = 'Camera';
