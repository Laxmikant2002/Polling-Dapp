import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Elections from './pages/Elections';
import Voting from './pages/Voting';
import Results from './pages/Results';
import VoteVerification from './pages/VoteVerification';
import AdminDashboard from './pages/AdminDashboard';
import MonitoringDashboard from './components/MonitoringDashboard';
import { ContractProvider } from './context/ContractContext';
import { Toaster } from 'sonner';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContractProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/voting" element={<Voting />} />
              <Route path="/results" element={<Results />} />
              <Route path="/verify" element={<VoteVerification />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/monitoring" element={<MonitoringDashboard />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </ContractProvider>
    </ThemeProvider>
  );
};

export default App; 