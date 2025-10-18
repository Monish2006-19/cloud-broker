import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCloud, FiUpload, FiMonitor, FiHome } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/upload', label: 'Upload Code', icon: FiUpload },
    { path: '/dashboard', label: 'Dashboard', icon: FiMonitor },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FiCloud className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">
              Cloud Broker
            </span>
            <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              C2C Pipeline
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="text-lg" />
                <span className="hidden sm:inline font-medium">{label}</span>
              </Link>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 hidden md:inline">
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;