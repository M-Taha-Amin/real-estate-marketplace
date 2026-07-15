import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux-store/authSlice';
import GoogleAuth from '../components/GoogleAuth';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const dispatch = useDispatch();

  const signInMutation = useMutation({
    mutationFn: async userData => {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      return responseData;
    },
    onSuccess: data => {
      dispatch(login(data.payload));
    },
    onError: () => {
      dispatch(logout());
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onSubmit = formData => {
    toast.promise(signInMutation.mutateAsync(formData), {
      loading: 'Signing you in...',
      success: 'Logged in!',
      error: err => err.message,
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-center text-3xl font-semibold my-7">Sign In</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          autoComplete="off"
          type="text"
          placeholder="email"
          className={`bg-white p-3 rounded-lg ${errors.email && 'outline-2 outline-red-500'}`}
          {...register('email')}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.email?.message}
        </p>
        <input
          type="password"
          placeholder="password"
          className={`bg-white p-3 rounded-lg ${errors.email && 'outline-2 outline-red-500'}`}
          {...register('password')}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.password?.message}
        </p>
        <button
          disabled={signInMutation.isPending}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer">
          Sign In
        </button>
        <GoogleAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Don't have an account?</p>
        <Link to="/sign-up">
          <span className="text-blue-700 hover:underline">Sign up</span>
        </Link>
      </div>
    </div>
  );
}
