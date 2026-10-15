import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import './index.css';
import { router } from './routes';
import { AdminProvider } from './store/AdminContext';
import { AuthProvider } from './store/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <AdminProvider>
          <RouterProvider router={router} />
        </AdminProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
