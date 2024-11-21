import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import UsernamePage from './pages/Username';  // Renamed ProfilePage to Username
import HomePage from './pages/HomePage';
import MentionsPage from './pages/MentionsPage';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/username" element={<UsernamePage />} /> {/* For setting username */}
        <Route path="/home" element={<HomePage />} />         {/* Home page where the feed is */}
        <Route path="/mentions" element={<MentionsPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;







