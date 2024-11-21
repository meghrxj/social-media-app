import React from "react";
import { Link } from "react-router-dom";
import Feed from "../components/Feed"; // To display the posts
import { HiHome, HiBell, HiUser, HiUsers } from "react-icons/hi"; // Import icons

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-white rounded-lg">
      {/* Header with navigation links */}
      <header className="w-full flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-semibold">IGX</h1>
        <nav className="flex space-x-6">
          <Link to="/home" className="flex flex-col items-center text-blue-600 hover:text-blue-800">
            <HiHome size={24} />
            <span className="text-sm">Home</span>
          </Link>
          <Link to="/notification" className="flex flex-col items-center text-blue-600 hover:text-blue-800">
            <HiBell size={24} />
            <span className="text-sm">Notifications</span>
          </Link>
          <Link to="/people" className="flex flex-col items-center text-blue-600 hover:text-blue-800">
            <HiUsers size={24} />
            <span className="text-sm">People</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-blue-600 hover:text-blue-800">
            <HiUser size={24} />
            <span className="text-sm">Profile</span>
          </Link>
        </nav>
      </header>

      {/* Feed Section */}
      <Feed /> {/* Component to display the feed */}
    </div>
  );
};

export default HomePage;

