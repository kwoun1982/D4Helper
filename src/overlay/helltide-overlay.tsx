import React from 'react';
import ReactDOM from 'react-dom/client';
import HelltideOverlayApp from './HelltideOverlayApp';

console.log("[HELLTIDE-OVERLAY] Entry point script running...");

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

console.log("[HELLTIDE-OVERLAY] Root created, rendering...");
root.render(
    <React.StrictMode>
        <HelltideOverlayApp />
    </React.StrictMode>
);
