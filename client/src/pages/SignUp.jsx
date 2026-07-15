import { Link, Navigate } from 'react-router-dom';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { login, logout } from '../redux-store/authSlice';
import GoogleAuth from '../components/GoogleAuth';

const signUpSchema = z.object({
  name: z.string().min(4),
  email: z.email(),
  password: z.string().min(8),
});

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const dispatch = useDispatch();

  const signUpMutation = useMutation({
    mutationFn: async userData => {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message);
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

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const onSubmit = formData => {
    toast.promise(signUpMutation.mutateAsync(formData), {
      loading: 'Signing you up...',
      success: 'Logged in!',
      error: err => err.message,
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-center text-3xl font-semibold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="name"
          className={`p-3 rounded-lg bg-white ${errors.name && 'outline-2 outline-red-500'}`}
          {...register('name')}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.name?.message}
        </p>
        <input
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
          className={`bg-white p-3 rounded-lg ${errors.password && 'outline-2 outline-red-500'}`}
          {...register('password')}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.password?.message}
        </p>
        <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer">
          Sign Up
        </button>
        <GoogleAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-700 hover:underline">Sign in</span>
        </Link>
      </div>
    </div>
  );
}
