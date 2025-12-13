import React from 'react';
import ReactDOM from 'react-dom/client';
import OverlayApp from './OverlayApp';

const root = ReactDOM.createRoot(
    document.getElementById('overlay-root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <OverlayApp />
    </React.StrictMode>
);
