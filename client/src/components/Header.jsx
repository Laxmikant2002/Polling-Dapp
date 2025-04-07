import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContract } from '../context/ContractContext';
import ConnectWallet from './ConnectWallet';

const Header = () => {
  const { isAdminUser, account } = useContract();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img className="h-8 w-auto" src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" alt="Logo" />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              {account && (
                <>
                  <Link
                    to="/elections"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Elections
                  </Link>
                  <Link
                    to="/results"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Results
                  </Link>
                  {isAdminUser && (
                    <Link
                      to="/admin"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
              {!account && (
                <button
                  onClick={() => navigate('/login')}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
            <div className="ml-6 flex items-center">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;