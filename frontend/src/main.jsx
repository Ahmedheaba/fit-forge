import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#111111',
            border: '1px solid rgba(17,17,17,0.12)',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 24px rgba(17,17,17,0.10)',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#E74C3C', secondary: '#fff' } },
        }}
      />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
