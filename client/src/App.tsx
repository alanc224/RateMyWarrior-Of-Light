import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import './App.css'

import Home from './pages/Home/Home'
import ResultsPage from './pages/ResultsPage/ResultsPage';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results/:category/" element={<ResultsPage />} />
      </Routes>
    </>
  )
}

export default App
