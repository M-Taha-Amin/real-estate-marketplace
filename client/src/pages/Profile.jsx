import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Link, redirect, useNavigate } from 'react-router-dom';
import { logout } from '../redux-store/authSlice.js';

export default function Profile() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateProfileMutation = useMutation({
    mutationFn: async requestData => {
      const response = await fetch('/api/users', {
        body: requestData,
        method: 'PUT',
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('auth');
    },
  });
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users', {
        method: 'DELETE',
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      return responseData;
    },
    onSuccess: () => {
      dispatch(logout());
      return navigate('/');
    },
  });

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: files[0],
      }));
    } else {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();

    const { name, email, avatar } = formData;
    if (name) data.append('name', name);
    if (email) data.append('email', email);
    if (avatar) data.append('avatar', avatar);

    toast.promise(updateProfileMutation.mutateAsync(data), {
      loading: 'Updating Profile...',
      success: 'Profile Updated',
      error: err => err.message,
    });
  }

  function handleDeleteAccount() {
    toast.promise(deleteAccountMutation.mutateAsync(), {
      loading: 'Deleting Account...',
      success: 'Account Deleted',
      error: err => err.message,
    });
  }

  function checkDisableForm() {
    for (let key of Object.keys(formData)) {
      if (user[key] !== formData[key]) return false;
    }
    return true;
  }

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl -mt-36">
            <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>

            <p className="mt-3 text-gray-600">
              Are you sure you want to delete your account? This action cannot
              be undone. All of your data will be permanently removed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium cursor-pointer text-gray-700 transition hover:bg-gray-100">
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white cursor-pointer transition hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-lg mx-auto p-3">
        <h1 className="text-3xl font-semibold text-center my-8">Profile</h1>
        <form
          encType="multipart/form-data"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}>
          <div className="relative self-center group">
            <img
              className="rounded-full size-24 object-cover cursor-pointer"
              src={
                formData.avatar
                  ? URL.createObjectURL(formData.avatar)
                  : user.avatar
              }
              alt="profile-pic"
            />
            <div
              className="absolute inset-0 rounded-full bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer text-white font-bold"
              onClick={() => {
                inputRef.current.click();
              }}>
              Change
            </div>
          </div>
          <input
            name="avatar"
            type="file"
            onChange={handleChange}
            hidden
            accept="image/*"
            max="2048"
            ref={inputRef}
          />
          <input
            name="name"
            type="text"
            placeholder="name"
            className="bg-white p-3 rounded-lg"
            defaultValue={formData.name}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="email"
            className="bg-white p-3 rounded-lg"
            defaultValue={formData.email}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80 not-disabled:cursor-pointer"
            disabled={checkDisableForm() || updateProfileMutation.isPending}>
            Update Profile
          </button>
        </form>
        <div className="flex justify-between mt-5">
          <span
            onClick={() => setShowDeleteModal(true)}
            className="text-red-700 cursor-pointer">
            Delete account
          </span>
          <Link to="/profile/change-password">
            <span className="text-red-700 cursor-pointer">Change Password</span>
          </Link>
        </div>
      </div>
    </>
  );
}
