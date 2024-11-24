import React from "react";
import { useNavigate } from "react-router-dom";
import { HiHome, HiBell, HiUsers, HiUser } from "react-icons/hi";

const NavButtons: React.FC = () => {
  const navigate = useNavigate();

  // Navigation Menu Items
  const navItems = [
    { label: "Home", path: "/home", icon: <HiHome size={24} /> },
    { label: "Notifications", path: "/notification", icon: <HiBell size={24} /> },
    { label: "People", path: "/people", icon: <HiUsers size={24} /> },
    { label: "Profile", path: "/profile", icon: <HiUser size={24} /> },
  ];

  // Function for onClick to navigate using react router
  return (
    <nav className="flex space-x-6">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="flex flex-col items-center text-blue-600 hover:text-blue-800"
        >
          {item.icon}
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
 
export default NavButtons;
