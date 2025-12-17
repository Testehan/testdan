import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';
import { Suspense, lazy } from 'react';
import HomePage from './pages/homePage';
import QuotesPage from './pages/quotesPage';
import MentalModelsPage from './pages/mentalModelsPage.tsx';
import AlertsPage from './pages/alertsPage';
import UsagePage from './pages/UsagePage';
import NextStepPage from './pages/NextStepPage';
import LLMCaptureTool from './components/LLMCaptureTool';

// Lazy load heavy components to reduce initial bundle size
const MentalModelsList = lazy(() => import("./components/mentalModelsList.tsx"));
const StockPage = lazy(() => import('./pages/StockPage'));

function App() {


  return (
    <>
      <Router>
        {/* right now i just want different pages, and the quotes page does not have a menu...i could at some point use the navbar from main
         page and when a user clicks on the Quotes there to take him to the Quotes page not the quotes section*/}
        {/* Navbar */}
        {/*<nav className="bg-blue-600 text-white p-4">*/}
        {/*  <ul className="flex justify-center space-x-6">*/}
        {/*    <li>*/}
        {/*      <a href="/" className="hover:underline">Home</a>*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <a href="/quotes" className="hover:underline">Quotes</a>*/}
        {/*    </li>*/}
        {/*  </ul>*/}
        {/*</nav>*/}

        {/* Routes */}
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/mental" element={<MentalModelsPage />} />
            <Route path="/mental/:category" element={<MentalModelsList />} />
            <Route path="/nextstep" element={<NextStepPage />} />
            <Route path={`${BASE_PATH}/`} element={<StockPage />} />
            <Route path={`${BASE_PATH}/stocks`} element={<StockPage />} />
            <Route path={`${BASE_PATH}/stocks/:symbol`} element={<StockPage />} />
            <Route path={`${BASE_PATH}/alerts`} element={<AlertsPage />} />
            <Route path={`${BASE_PATH}/usage`} element={<UsagePage />} />
          </Routes>
        </Suspense>
        <LLMCaptureTool />
      </Router>
    </>
  )
}

export default App
