import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Gamification from './features/gamification/Gamification';
import Profile from './features/profile/Profile';
import ResourcesHub from './features/resources/ResourcesHub';
import ProviderDashboard from './features/resources/ProviderDashboard';
import FarmerDashboard from './features/resources/FarmerDashboard';

// 1. Import the new Login Page!
import LoginPage from './features/auth/LoginPage';

const DummyGainer = () => <div className="p-10 text-2xl font-bold text-green-700">🚜 Gainer Dashboard Loading...</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 2. Add the standalone Login Route (outside the Dashboard Layout) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<ResourcesHub />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="profile" element={<Profile />} />
          <Route path="resources" element={<ResourcesHub />} />
          <Route path="resources/provider" element={<ProviderDashboard />} />
          <Route path="resources/gainer" element={<FarmerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;