import React from "react";
import { Link } from "react-router-dom";
import Feed from "../components/Feed"; // To display the posts

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header with navigation links */}
      <header className="w-full flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">IGX</h1>
        <nav className="flex space-x-4">
          <Link to="/home" className="text-blue-600">Home</Link>
          <Link to="/mentions" className="text-blue-600">Mentions</Link>
          <Link to="/profile" className="text-blue-600">Profile</Link>
        </nav>
      </header>

      {/* Feed Section */}
      <Feed /> {/* Component to create new posts */}
    </div>
  );
};

export default HomePage;
