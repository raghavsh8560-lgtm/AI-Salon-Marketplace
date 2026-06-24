import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';

// Pages
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { SalonDetails } from './pages/SalonDetails';
import { BookingFlow } from './pages/BookingFlow';
import { Dashboard } from './pages/Dashboard';
import { AIAssistant } from './pages/AIAssistant';
import { Auth } from './pages/Auth';
import { Contact } from './pages/Contact';

// Scroll to top helper component on router page switches
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-brand-bg text-gray-905 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-250">
          
          {/* Header Navigation */}
          <Navbar />

          {/* Main Routing Container */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/salon/:id" element={<SalonDetails />} />
              <Route path="/booking-flow/:id" element={<BookingFlow />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Toast Notification Layer */}
          <ToastContainer />

          {/* Footer Bottom Block */}
          <Footer />

        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
