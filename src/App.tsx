import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UsernamePage from './pages/Username';  
import HomePage from './pages/HomePage';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';
import People from './pages/People';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/username" element={<UsernamePage />} /> 
        <Route path="/home" element={<HomePage />} />       
        <Route path="/notification" element={<NotificationsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/people" element={<People />} />
      </Routes>
    </Router>
  );
}

export default App;







