import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-[100dvh] bg-neutral-900 text-white items-center">
            <div className="w-full max-w-md flex-1 relative flex flex-col pb-[70px]">
                <Outlet />
            </div>
            <Navigation />
        </div>
    );
};
