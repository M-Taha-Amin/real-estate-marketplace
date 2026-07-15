import { GoogleLogin } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { login, logout } from '../redux-store/authSlice';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

export default function GoogleAuth() {
  const dispatch = useDispatch();
  const googleMutation = useMutation({
    mutationFn: async idToken => {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Google Login failed');
      }
      return response.json();
    },
    onSuccess: data => {
      dispatch(login(data.payload));
    },
    onError: () => {
      dispatch(logout());
    },
  });
  return (
    <GoogleLogin
      text="continue_with"
      theme="outline"
      logo_alignment="center"
      onSuccess={credendialResponse => {
        toast.promise(
          googleMutation.mutateAsync(credendialResponse.credential),
          {
            loading: 'Signing you in...',
            success: 'Logged in!',
            error: err => err.message,
          },
        );
      }}
    />
  );
}
