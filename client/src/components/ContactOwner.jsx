import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactOwner({ ownerId, listingTitle, onCancel }) {
  const getListingOwnerQuery = useQuery({
    queryKey: ['getListingOwner', ownerId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${ownerId}`);
      const responseData = await response.json();
      if (!response.ok) {
        throw Error('Failed to load owner details...');
      }
      return responseData.payload;
    },
  });
  const [message, setMessage] = useState('');

  if (getListingOwnerQuery.isLoading) {
    return (
      <button
        className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer"
        disabled>
        Loading...
      </button>
    );
  }

  if (getListingOwnerQuery.isError) {
    return (
      <p className="text-red-500 font-semibold text-xl">
        Failed to Contact Owner, Please try again later
      </p>
    );
  }

  if (getListingOwnerQuery.isSuccess) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <p className="text-black/85">
          Contact <strong>{getListingOwnerQuery.data.email}</strong> for{' '}
          <strong>{listingTitle}</strong>
        </p>
        <textarea
          name="message"
          className="bg-white rounded-lg p-3 focus:outline-none shadow-lg"
          id="message"
          placeholder="Enter your message here..."
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <div className="flex gap-2">
          <Link
            to={`mailto:${getListingOwnerQuery.data.email}?subject=Regarding ${listingTitle}&body=${message}`}
            className="flex-1">
            <button className="w-full bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer">
              Send
            </button>
          </Link>
          <button
            className="flex-1 border-2 border-red-700 text-red-700 p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer hover:bg-red-700 hover:text-white transition-colors"
            onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}
