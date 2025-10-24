import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import './App.css'

import Home from './pages/Home/Home'
import ResultsPage from './pages/ResultsPage/ResultsPage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import DetailedPage from './pages/DetailedPage/DetailedPage';

type ModalView = 'LOGIN' | 'SIGN_UP' | null;
function App() {
  const [modalView, setModalView] = useState<ModalView>(null);

  const openLoginModal = () => setModalView('LOGIN');
  const openSignUpModal = () => setModalView('SIGN_UP');
  const closeModal = () => setModalView(null);

  return (
    <>
      {modalView === 'LOGIN' && <Login onClose={closeModal} onSwitchToSignUp={openSignUpModal} />}
      {modalView === 'SIGN_UP' && <Signup onClose={closeModal} onSwitchToLogin={openLoginModal} />}
      <Routes>
        <Route path="/" element={<Home onLoginClick={openLoginModal} onSignUpClick={openSignUpModal}/>} />
        <Route path="/results/player/:query" element={<ResultsPage onLoginClick={openLoginModal} onSignUpClick={openSignUpModal}/>} />
        <Route path="/detailpage/:id" element={<DetailedPage onLoginClick={openLoginModal} onSignUpClick={openSignUpModal}/>} />
      </Routes>
    </>
  )
}

export default App
