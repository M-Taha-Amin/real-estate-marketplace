import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaParking,
  FaChair,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import ContactOwner from '../components/ContactOwner';

export default function SingleListing() {
  const { id } = useParams();
  const getSingleListingQuery = useQuery({
    queryKey: ['getSingleListing', id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      const responseData = await response.json();

      if (!response.ok) {
        throw Error(responseData.message || 'Failed to Fetch Listing');
      }

      return responseData.payload;
    },
  });
  const listing = getSingleListingQuery.data;
  const ownerId = listing?.user;
  const currentUser = useSelector(state => state.auth.user);
  const [contactOwner, setContactOwner] = useState(false);

  if (getSingleListingQuery.isPending) {
    return <p className="text-center mt-12 text-2xl">Loading...</p>;
  }

  if (getSingleListingQuery.isError) {
    return (
      <p className="text-center mt-12 text-2xl">Something went wrong...</p>
    );
  }

  const formatPrice = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (getSingleListingQuery.isSuccess) {
    return (
      <main>
        <Swiper navigation modules={[Navigation]}>
          {listing.images.map(image => (
            <SwiperSlide key={image.url}>
              <div
                className="hover:scale-110 transition-transform  h-137.5 bg-blue-50"
                style={{
                  backgroundImage: `url(${image.url})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="border-t border-slate-300 flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
          <p className="text-2xl font-semibold">
            {listing.title} -{' '}
            <span className="inline-flex items-center gap-2">
              {listing.discountPercentage > 0
                ? formatPrice(
                    listing.price -
                      (listing.price * listing.discountPercentage) / 100,
                  )
                : formatPrice(listing.price)}
              {listing.discountPercentage > 0 && (
                <span className="text-sm text-black/40 line-through">
                  ${listing.price}
                </span>
              )}
              {listing.type === 'rent' && ' / month'}
            </span>
          </p>
          <p className="flex items-center mt-6 gap-2 text-slate-600  text-sm">
            <FaMapMarkerAlt className="text-green-500" />
            {listing.address}
          </p>
          <div className="flex gap-4">
            <p
              className={`${listing.type === 'rental' ? 'bg-blue-500' : 'bg-green-700 '} w-full max-w-50 text-white text-center p-1 rounded-md`}>
              {listing.type === 'rental' ? 'For Rent' : 'For Sale'}
            </p>
            {listing.discountPercentage > 0 && (
              <p className="bg-green-900 w-full max-w-50 text-white text-center p-1 rounded-md">
                {listing.discountPercentage}% OFF
              </p>
            )}
          </div>
          <p className="text-slate-800">
            <span className="font-semibold text-black">Description - </span>
            {listing.description}
          </p>
          <ul className="text-green-700 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6">
            <li className="flex items-center gap-1 whitespace-nowrap">
              <FaBed className="text-lg" />
              {listing.bedrooms > 1
                ? `${listing.bedrooms} bedrooms `
                : `${listing.bedrooms} bedroom `}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap">
              <FaBath className="text-lg" />
              {listing.bathrooms > 1
                ? `${listing.bathrooms} bathrooms `
                : `${listing.bathrooms} bathroom `}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap">
              <FaParking className="text-lg" />
              {listing.parking ? 'Parking spot' : 'No Parking'}
            </li>
            <li className="flex items-center gap-1 whitespace-nowrap">
              <FaChair className="text-lg" />
              {listing.furnished ? 'Furnished' : 'Unfurnished'}
            </li>
          </ul>
          {contactOwner && (
            <ContactOwner
              listingTitle={listing.title}
              ownerId={ownerId}
              key={ownerId}
              onCancel={() => setContactOwner(false)}
            />
          )}
          {!contactOwner && currentUser && currentUser._id !== ownerId && (
            <button
              className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer"
              onClick={() => setContactOwner(true)}>
              Contact Owner
            </button>
          )}
        </div>
      </main>
    );
  }
}
