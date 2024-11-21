import React from "react";
import Feed from "../components/Feed"; // To display the posts
import NavButtons from "../components/NavButtons"; // Import the reusable NavButtons component

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-white rounded-lg">
      {/* Header with navigation links */}
      <header className="w-full flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-semibold">IGX</h1>
        <NavButtons /> {/* Use the reusable NavButtons component */}
      </header>

      {/* Feed Section */}
      <Feed /> {/* Component to display the feed */}
    </div>
  );
};

export default HomePage;



