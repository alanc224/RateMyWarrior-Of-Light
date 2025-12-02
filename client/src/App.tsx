import { Routes, Route } from 'react-router-dom';
import './App.css';
import { useAuth } from './services/AuthContext';

import Home from './pages/Home/Home';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import DetailedPage from './pages/DetailedPage/DetailedPage';
import RatingPage from './pages/RatingPage/RatingPage';

function App() {
    const { modalView, setModalView } = useAuth()
    const closeModal = () => setModalView(null);

    return (
        <>
            {modalView === 'LOGIN' && <Login onClose={closeModal} />}
            {modalView === 'SIGN_UP' && <Signup onClose={closeModal} />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/results/player/:world/:query" element={<ResultsPage />} />
                <Route path="/detailpage/:id" element={<DetailedPage />} />
                <Route path="/rating/:id" element={<RatingPage />} />
            </Routes>
        </>
    );
}

export default App;
