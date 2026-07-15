import React, { useState } from 'react';
import {
  FaBath,
  FaBed,
  FaCar,
  FaCheck,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

function ListingCard({ listing, onEdit, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!listing) {
    return null;
  }

  const {
    title,
    description,
    address,
    price,
    discountPercentage = 0,
    bathrooms,
    bedrooms,
    furnished,
    parking,
    type,
    images = [],
    createdAt,
  } = listing;

  // Get first image or placeholder
  const coverImage = images && images.length > 0 ? images[0].url : null;

  // Calculate discounted price
  const discountedPrice =
    discountPercentage > 0 ? price - (price * discountPercentage) / 100 : price;

  const formatPrice = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(listing._id);
    }
    setShowDeleteModal(false);
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 mb-0">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl -mt-36">
            <h2 className="text-xl font-bold text-gray-900">Delete Listing</h2>

            <p className="mt-3 text-gray-600">
              Are you sure you want to delete "{title}"? This action cannot be
              undone. All data associated with this listing will be permanently
              removed.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium cursor-pointer text-gray-700 transition hover:bg-gray-100">
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white cursor-pointer transition hover:bg-red-700">
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      <article className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
        {/* Cover Image with overlay info */}
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-contain object-center"
              onError={e => {
                e.target.src = 'https://placehold.co/1200x400?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaMapMarkerAlt className="mx-auto text-4xl mb-2" />
                <p>No images available</p>
              </div>
            </div>
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider  text-white ${
                type === 'rental' ? 'bg-blue-500' : 'bg-green-500 '
              }`}>
              {type === 'rental' ? 'For Rent' : 'For Sale'}
            </span>
            {discountPercentage > 0 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500 text-white">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Edit and Delete Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(listing)}
                className="cursor-pointer bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 focus:outline-none"
                aria-label="Edit listing">
                <FaEdit className="text-green-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="cursor-pointer bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 focus:outline-none"
                aria-label="Delete listing">
                <FaTrash className="text-red-600" />
              </button>
            )}
          </div>

          {/* Bottom overlay info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 leading-tight">
              {title}
            </h2>
            <div className="flex items-center text-sm sm:text-base opacity-90">
              <FaMapMarkerAlt className="mr-1.5 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>
        </div>

        {/* Content Section - Compact horizontal layout */}
        <div className="p-4 sm:p-6">
          {/* Price and Features Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              {discountPercentage > 0 ? (
                <>
                  <span className="text-gray-400 line-through text-lg">
                    {formatPrice(price)}
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600">
                    {formatPrice(discountedPrice)}
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-green-600">
                  {formatPrice(price)}
                </span>
              )}
              {type === 'rental' && (
                <span className="text-gray-500 text-sm">/month</span>
              )}
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <FaBed className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {bedrooms} bedrooms
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <FaBath className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {bathrooms} bathrooms
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <FaCar className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {parking ? 'Parking' : 'No parking'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <FaCheck className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {furnished ? 'Furnished' : 'Unfurnished'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
            {description}
          </p>

          {/* Footer with date */}
          {createdAt && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Listed {formatDate(createdAt)}</span>
              {images.length > 1 && <span>{images.length} photos</span>}
            </div>
          )}
        </div>
      </article>
    </>
  );
}

function MyListings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getMyListingsQuery = useQuery({
    queryKey: ['getMyListings'],
    queryFn: async () => {
      const response = await fetch('/api/listings/me');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load listings');
      }

      return data;
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async listingId => {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to Delete');
      }

      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getMyListings'] });
    },
  });

  const handleEdit = listing => {
    return navigate(`/listings/${listing._id}/edit`, {
      state: listing,
    });
  };

  const handleDelete = listingId => {
    toast.promise(deleteListingMutation.mutateAsync(listingId), {
      loading: 'Deleting Listing...',
      success: 'Listing Deleted',
      error: err => err.message,
    });
  };

  if (getMyListingsQuery.isPending) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Loading skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-300" />
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-300 rounded w-1/3" />
                <div className="h-8 bg-gray-300 rounded w-1/4" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-300 rounded w-20" />
                <div className="h-8 bg-gray-300 rounded w-20" />
                <div className="h-8 bg-gray-300 rounded w-24" />
                <div className="h-8 bg-gray-300 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-4 bg-gray-300 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (getMyListingsQuery.isError) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Listings
            </h2>
            <p className="text-gray-600 mb-6">
              {getMyListingsQuery.error?.message ||
                'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={() => getMyListingsQuery.refetch()}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const listings = getMyListingsQuery.data?.payload || [];
  console.log(listings);

  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Listings Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't created any listings yet. Create your first listing to
              get started!
            </p>
            <button
              onClick={() => navigate('/create-listing')}
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Create Listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Listings
          </h1>
          <button
            onClick={() => navigate('/create-listing')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base">
            + New Listing
          </button>
        </div>

        <div className="space-y-6">
          {listings.map(listing => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default MyListings;
