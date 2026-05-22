import { Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home/Home';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import DetailedPage from './pages/DetailedPage/DetailedPage';
import RatingPage from './pages/RatingPage/RatingPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results/player/:world/:query" element={<ResultsPage />} />
            <Route path="/detailpage/:id" element={<DetailedPage />} />
            <Route path="/rating/:id" element={<RatingPage />} />
        </Routes>
    );
}

export default App;