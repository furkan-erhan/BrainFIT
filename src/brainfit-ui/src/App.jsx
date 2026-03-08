import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Dashboard from './pages/Dashboard/Dashboard';
import LoginModal from './components/Auth/LoginModal';
import QuizLobby from './pages/QuizLobby/QuizLobby';
import { AuthProvider, useAuth } from './context/AuthContext';

const Header = ({ onOpenLogin }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl rotate-3 shadow-md">
            B
          </div>
          <span className="text-2xl font-black text-secondary tracking-tighter hidden sm:block">
            Brain<span className="text-primary italic">FIT</span>
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-800 leading-none">{user.username}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'text-red-500' : 'text-primary'}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors tooltip-trigger"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors px-4 py-2 hover:bg-primary/5 rounded-lg"
            >
              <FaUserCircle className="text-lg" />
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

const AppContent = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header onOpenLogin={() => setIsLoginModalOpen(true)} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lobby/:quizId" element={<QuizLobby />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-gray-50 border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} BrainFIT. Built for ultimate learning.
            </p>
          </div>
        </footer>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
