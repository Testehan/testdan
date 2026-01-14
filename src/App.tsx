import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import HomePage from './pages/homePage';
import QuotesPage from './pages/quotesPage';
import MentalModelsPage from './pages/mentalModelsPage.tsx';
import AlertsPage from './pages/alertsPage';
import UsagePage from './pages/UsagePage';
import NextStepPage from './pages/nextstep/NextStepPage';
import LLMCaptureTool from './components/LLMCaptureTool';
import LoginPage from './pages/login/LoginPage';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

const MentalModelsList = lazy(() => import("./components/mentalModelsList.tsx"));
const StockPage = lazy(() => import('./pages/StockPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/mental" element={<MentalModelsPage />} />
            <Route path="/mental/:category" element={<MentalModelsList />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route 
              path="/nextstep" 
              element={
                <ProtectedRoute>
                  <NextStepPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${BASE_PATH}/`} 
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${BASE_PATH}/stocks`} 
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${BASE_PATH}/stocks/:symbol`} 
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${BASE_PATH}/alerts`} 
              element={
                <ProtectedRoute>
                  <AlertsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path={`${BASE_PATH}/usage`} 
              element={
                <ProtectedRoute>
                  <UsagePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
        <LLMCaptureTool />
      </Router>
    </AuthProvider>
  );
}

export default App;