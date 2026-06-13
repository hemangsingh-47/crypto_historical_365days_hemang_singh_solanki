import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageContainer from './components/layout/PageContainer';
import Card from './components/ui/Card';

// Pages
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';

// Placeholder Pages for now
const Compare = () => <PageContainer title="Compare Coins"><Card>Compare Content</Card></PageContainer>;
const Analytics = () => <PageContainer title="Analytics"><Card>Analytics Content</Card></PageContainer>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;
