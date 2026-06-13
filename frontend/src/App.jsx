import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageContainer from './components/layout/PageContainer';
import Card from './components/ui/Card';

// Pages
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import CoinDetails from './pages/CoinDetails';
import Compare from './pages/Compare';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/coin/:id" element={<CoinDetails />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;
