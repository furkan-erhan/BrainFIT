import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Simple Navbar Shell */}
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

            <nav className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-red-600 flex items-center justify-center text-white text-[10px] font-bold">
                  JS
                </div>
                <span className="hidden md:block text-sm font-bold text-gray-700">Guest User</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} BrainFIT. Built for ultimate learning.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
