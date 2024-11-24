import React from "react";
import Feed from "../components/Feed"; 
import NavButtons from "../components/NavButtons"; 

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto bg-white rounded-lg">
      
      <header className="w-full flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-semibold">IGX</h1>
        <NavButtons /> 
      </header>
      <Feed /> 
    </div>
  );
};

export default HomePage;



