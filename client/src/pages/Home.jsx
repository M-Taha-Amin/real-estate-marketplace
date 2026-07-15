import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const {
    data: allListings,
    isPending,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ['getAllListings'],
    queryFn: async ({ pageParam }) => {
      let url = '/api/listings';
      const response = await fetch(url);
      const responseData = await response.json();
      if (!response.ok) {
        throw Error(responseData.message ?? 'Failed to fetch listings');
      }
      return responseData.payload;
    },
  });

  const rentalListings = allListings
    ?.filter(listing => listing.type === 'rental')
    .slice(0, 4);
  const forSaleListings = allListings
    ?.filter(listing => listing.type === 'for-sale')
    .slice(0, 4);
  const discountedListings = allListings
    ?.filter(listing => listing.discountPercentage > 0)
    .slice(0, 4);

  const imageUrlToListingIdMap = {};

  if (allListings) {
    for (let listing of allListings) {
      if (Object.keys(imageUrlToListingIdMap).length >= 5) break;
      listing?.images?.forEach(image => {
        imageUrlToListingIdMap[image.url] = listing._id.toString();
      });
    }
  }

  const listingsImages = allListings
    ? allListings.flatMap(listing => listing.images).slice(0, 5)
    : new Array(5).fill('https://placehold.co/1200x400?text=No+Image');

  return (
    <div>
      <div className="flex flex-col gap-6 py-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Find your next <span className="text-slate-500">perfect</span>
          <br /> place with ease
        </h1>
        <p className="text-gray-400 text-xs sm:text-base">
          We will help you find your home fast, easily and comfortably.
          <br />
          Our expert support is always by your side, forever.
        </p>
        <Link
          to="/search"
          className="text-xs sm:text-base text-blue-800 font-bold hover:underline w-fit">
          Browse Listings...
        </Link>
      </div>
      <Swiper navigation modules={[Navigation]}>
        {listingsImages &&
          listingsImages?.map(image => (
            <SwiperSlide>
              <Link
                key={image.url + image.publicId}
                to={`/listings/${imageUrlToListingIdMap[image.url]}`}>
                <div className="relative group">
                  <div
                    className="h-125"
                    style={{
                      backgroundImage: `url(${image.url})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                </div>
              </Link>
            </SwiperSlide>
          ))}
      </Swiper>
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10">
        {discountedListings?.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Discount Offers
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={`/search?discountOffered=true`}>
                Show more discount offers
              </Link>
            </div>
            <div className="flex flex-warp gap-4">
              {discountedListings.map(listing => (
                <ListingCard listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentalListings?.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Rental Listings
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={`/search?type=rental`}>
                Show more rental options
              </Link>
            </div>
            <div className="flex flex-warp gap-4">
              {rentalListings.map(listing => (
                <ListingCard listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {forSaleListings?.length > 0 && (
          <div>
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                For Sale Listings
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={`/search?type=for-sale`}>
                Show more for sale options
              </Link>
            </div>
            <div className="flex flex-warp gap-4">
              {forSaleListings.map(listing => (
                <ListingCard listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
