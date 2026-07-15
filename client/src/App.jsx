import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { login, logout } from './redux-store/authSlice';
import loading from './assets/loading.gif';
import { useEffect } from 'react';
import ChangePassword from './pages/ChangePassword';
import CreateListing from './pages/CreateListing';
import SingleListing from './pages/SingleListing';
import MyListings from './pages/MyListings';
import EditListing from './pages/EditListing';
import SearchListings from './pages/SearchListings';

export default function App() {
  const dispatch = useDispatch();

  const getMeQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Unauthorized');
      }
      return await response.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (getMeQuery.isSuccess) {
      dispatch(login(getMeQuery.data.payload));
    } else if (getMeQuery.isError) {
      dispatch(logout());
    }
  }, [getMeQuery.isSuccess, getMeQuery.isError, getMeQuery.data, dispatch]);

  if (getMeQuery.isPending) {
    return (
      <div className="h-screen flex bg-white items-center justify-center">
        <img className="w-64" src={loading} />;
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/listings/:id" element={<SingleListing />} />
        <Route path="/search" element={<SearchListings />} />
        <Route path="/" element={<Home />} />

        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/listings/me" element={<MyListings />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
