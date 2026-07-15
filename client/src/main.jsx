import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux-store/store.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
