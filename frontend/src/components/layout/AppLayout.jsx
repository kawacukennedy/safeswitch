import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export const AppLayout = () => {
    return (
        <>
            <div style={{ paddingBottom: '70px' }}> {/* Space for bottom nav */}
                <Outlet />
            </div>
            <Navigation />
        </>
    );
};
