import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux-store/authSlice.js';

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/sign-out', { method: 'POST' });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      return responseData;
    },
    onSuccess: () => {
      dispatch(logout());
    },
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    signoutMutation.mutate();
  }

  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl">
            <span className="text-slate-500">Real</span>
            <span className="text-slate-700">State</span>
          </h1>
        </Link>
        <ul className="flex items-center gap-2 min-[440px]:gap-8">
          <li>
            <Link to="/" className="text-slate-700 hover:underline">
              Home
            </Link>
          </li>

          <li>
            <Link to="/search" className="text-slate-700 hover:underline">
              <span className="min-[440px]:hidden">Search</span>
              <span className="hidden min-[440px]:inline">Search Listings</span>
            </Link>
          </li>

          <li>
            <Link to="/about" className="text-slate-700 hover:underline">
              About
            </Link>
          </li>

          {isAuthenticated ? (
            <li ref={menuRef} className="relative">
              <img
                src={user.avatar}
                alt="Profile"
                loading="eager"
                onClick={() => setShowMenu(prev => !prev)}
                className="size-9 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-slate-400 transition"
              />

              {showMenu && (
                <ul className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg bg-white shadow-xl border border-slate-200 z-50">
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 hover:bg-slate-100 transition-colors">
                      Profile
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/create-listing"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 border-t border-gray-300 hover:bg-slate-100 transition-colors">
                      Create Listing
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/listings/me"
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 border-t border-gray-300 hover:bg-slate-100 transition-colors">
                      My Listings
                    </Link>
                  </li>

                  <li
                    onClick={() => {
                      setShowMenu(false);
                      handleLogout();
                    }}
                    className="px-4 py-3 border-t border-gray-300 text-red-600 hover:bg-red-50 cursor-pointer transition-colors">
                    Sign Out
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <Link to="/sign-in" className="text-slate-700 hover:underline">
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
