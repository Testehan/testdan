import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage';
import QuotesPage from './pages/quotesPage';
import MentalModelsPage from './pages/mentalModelsPage.tsx';
import MentalModelsList from "./components/mentalModelsList.tsx";
import StockPage from './pages/StockPage'; // Import StockPage

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
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/mental" element={<MentalModelsPage />} />
            <Route path="/mental/:category" element={<MentalModelsList />} />
            <Route path="/stocks" element={<StockPage />} />
            <Route path="/stocks/:symbol" element={<StockPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
