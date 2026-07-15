import React from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import toast from 'react-hot-toast';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    error: 'New Password must be different than current Password',
    path: ['newPassword'],
  });

export default function ChangePassword() {
  const changePasswordMutation = useMutation({
    mutationFn: async requestData => {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      return responseData.payload;
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = formData => {
    toast.promise(changePasswordMutation.mutateAsync(formData), {
      loading: 'Updating Password...',
      success: 'Password Updated!',
      error: err => err.message,
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-center text-3xl font-semibold my-7">
        Update Password
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        id="updatePasswordForm">
        <input
          type="password"
          {...register('currentPassword')}
          placeholder="current password"
          className={`bg-white p-3 rounded-lg ${errors.currentPassword && 'outline-2 outline-red-500'}`}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.currentPassword?.message}
        </p>
        <input
          type="password"
          {...register('newPassword')}
          placeholder="new password"
          className={`bg-white p-3 rounded-lg ${errors.newPassword && 'outline-2 outline-red-500'}`}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.newPassword?.message}
        </p>
        <input
          type="password"
          {...register('confirmPassword')}
          placeholder="confirm new password"
          className={`bg-white p-3 rounded-lg ${errors.confirmPassword && 'outline-2 outline-red-500'}`}
        />
        <p className="-mt-3 text-xs text-red-500 font-bold">
          {errors.confirmPassword?.message}
        </p>
        <div className="flex gap-4">
          <button
            type="submit"
            form="updatePasswordForm"
            className="flex-1 bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer">
            Update
          </button>
          <Link to="/profile" className="flex-1">
            <button
              type="button"
              className="bg-white text-black outline-1 outline-gray-300 p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer w-full">
              Back
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
