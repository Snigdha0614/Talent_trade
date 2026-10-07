import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import BrowseServicesPage from './pages/BrowseServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BrowseFreelancersPage from './pages/BrowseFreelancersPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import BrowseProjectsPage from './pages/BrowseProjectsPage';
import ProjectWorkspacePage from './pages/ProjectWorkspacePage';
import SkillExchangePage from './pages/SkillExchangePage';
import DashboardPage from './pages/DashboardPage';
import ProfileEditPage from './pages/ProfileEditPage';
import OfferServicePage from './pages/OfferServicePage';
import PostProjectPage from './pages/PostProjectPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<BrowseServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/freelancers" element={<BrowseFreelancersPage />} />
                <Route path="/profile/:id" element={<FreelancerProfilePage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/projects" element={<BrowseProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
                <Route path="/skill-exchange" element={<SkillExchangePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/offer-service" element={<OfferServicePage />} />
                <Route path="/post-project" element={<PostProjectPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
