import { Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home/Home';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import DetailedPage from './pages/DetailedPage/DetailedPage';
import RatingPage from './pages/RatingPage/RatingPage';
import NotFound from './pages/404/404';
import DashboardLayout from './layouts/DashboardLayout';
import RoleGate from './components/RoleGate';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import ModToolsPage from './pages/ModToolsPage/ModToolsPage';
import AdminDashboardPage from './pages/AdminDashboardPage/AdminDashboardPage';


function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results/player/:world/:query" element={<ResultsPage />} />
            <Route path="/detailpage/:id" element={<DetailedPage />} />
            <Route path="/rating/:id" element={<RatingPage />} />
            <Route path="/profile" element={
                <DashboardLayout>
                <UserProfilePage />
                </DashboardLayout>
            } />

            <Route path="/mod-panel" element={
                <RoleGate allowedRoles={['mod', 'admin']}>
                <DashboardLayout>
                    <ModToolsPage />
                </DashboardLayout>
                </RoleGate>
            } />

            <Route path="/admin-panel" element={
                <RoleGate allowedRoles={['admin']}>
                <DashboardLayout>
                    <AdminDashboardPage />
                </DashboardLayout>
                </RoleGate>
            } />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;