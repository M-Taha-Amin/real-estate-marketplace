import React, { useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { data, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import ListingCard from '../components/ListingCard';

const getListingsSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['rental', 'for-sale', 'both']).default('both'),
  discountOffered: z.preprocess(val => val === 'yes', z.boolean()),
  parking: z.coerce.boolean(),
  furnished: z.coerce.boolean(),
  sort: z
    .enum(['latest', 'oldest', 'price_lth', 'price_htl'])
    .default('latest'),
});

export default function SearchListings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getDefaultValues = () => ({
    query: searchParams.get('query') ?? '',
    type: searchParams.get('type') ?? 'both',
    discountOffered:
      searchParams.get('discountOffered') === 'false' ? 'no' : 'yes',
    parking: (() => {
      if (searchParams.get('parking')) return searchParams.get('parking');
      return true;
    })(),
    furnished: (() => {
      if (searchParams.get('furnished')) return searchParams.get('furnished');
      return true;
    })(),
    sort: (() => {
      const sortBy = searchParams.get('sortBy') ?? 'createdAt';
      const order = searchParams.get('order') ?? 'desc';

      const sortOptions = {
        price_asc: 'price_lth',
        price_desc: 'price_htl',
        createdAt_asc: 'oldest',
        createdAt_desc: 'latest',
      };

      return sortOptions[`${sortBy}_${order}`] ?? 'latest';
    })(),
  });

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(getListingsSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    data,
    isPending,
    isSuccess,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['getListings', searchParams.toString()],
    queryFn: async ({ pageParam }) => {
      let url = `/api/listings/search?page=${pageParam}&limit=5`;
      if (searchParams.size > 0) url = url + '&' + searchParams.toString();
      const response = await fetch(url);
      const responseData = await response.json();
      if (!response.ok) {
        throw Error(responseData.message ?? 'Failed to fetch listings');
      }
      return responseData.payload;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  const listings = data?.pages?.flatMap(page => page.listings);
  function onSubmit(formData) {
    const params = new URLSearchParams();
    for (let key of Object.keys(formData)) {
      if (formData[key] === '' || key === 'sort') continue;
      params.set(key, formData[key]);
    }
    const sortOptions = {
      latest: { sortBy: 'createdAt', order: 'desc' },
      oldest: { sortBy: 'createdAt', order: 'asc' },
      price_htl: { sortBy: 'price', order: 'desc' },
      price_lth: { sortBy: 'price', order: 'asc' },
    };
    const { sortBy, order } = sortOptions[formData?.sort];
    params.set('sortBy', sortBy);
    params.set('order', order);
    setSearchParams(params);
  }

  return (
    <div className="flex flex-col md:flex-row select-none">
      <div className="p-7 border-b border-gray-300 sm:border-r md:min-h-screen">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label htmlFor="search" className="whitespace-nowrap font-bold">
              Search Term:
            </label>
            <input
              {...register('query')}
              id="search"
              type="text"
              placeholder="Search..."
              className="rounded-lg p-3 w-full bg-white"
            />
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <b>Type:</b>
            <div className="flex gap-1 items-center">
              <input
                type="radio"
                {...register('type')}
                value="rental"
                id="rental"
                className="w-4"
              />
              <label htmlFor="rental">Rental</label>
            </div>
            <div className="flex gap-1 items-center">
              <input
                {...register('type')}
                type="radio"
                name="type"
                value="for-sale"
                id="sale"
                className="w-4"
              />
              <label htmlFor="sale">For-Sale</label>
            </div>
            <div className="flex gap-1 items-center">
              <input
                {...register('type')}
                type="radio"
                name="type"
                value="both"
                id="both"
                className="w-4"
              />
              <label htmlFor="both">Both</label>
            </div>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <b>Discount Offered:</b>
            <div className="flex gap-1 items-center">
              <input
                type="radio"
                {...register('discountOffered')}
                id="yes"
                value="yes"
                name="discountOffered"
                className="w-4"
              />
              <label htmlFor="yes">Yes</label>
            </div>
            <div className="flex gap-1 items-center">
              <input
                {...register('discountOffered')}
                type="radio"
                name="discountOffered"
                id="no"
                value="no"
                className="w-4"
              />
              <label htmlFor="no">No</label>
            </div>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <b>Amenities:</b>
            <div className="flex gap-1 items-center">
              <input
                type="checkbox"
                {...register('parking')}
                id="parking"
                className="w-4"
              />
              <label htmlFor="parking">Parking</label>
            </div>
            <div className="flex gap-1 items-center">
              <input
                type="checkbox"
                {...register('furnished')}
                id="furnished"
                className="w-4"
              />
              <label htmlFor="furnished">Furnished</label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort">Sort</label>
            <select
              {...register('sort')}
              className="rounded-lg p-3 bg-white border border-gray-300"
              id="sort">
              <option value="latest">Most Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_lth">Price low to high</option>
              <option value="price_htl">Price high to low</option>
            </select>
          </div>
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 cursor-pointer">
            Search
          </button>
        </form>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold border-b p-3 border-gray-300 text-slate-700">
          Listings:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {isPending && (
            <p className="text-xl text-slate-700 text-center w-full">
              Loading...
            </p>
          )}
          {isError && (
            <p className="text-xl text-red-700 text-center w-full">
              Failed to fetch listings...
            </p>
          )}
          {isSuccess && listings && listings.length === 0 && (
            <p className="text-xl text-slate-700">No listing found!</p>
          )}
          {isSuccess &&
            listings &&
            listings.length > 0 &&
            listings.map(listing => (
              <ListingCard listing={listing} key={listing._id} />
            ))}
        </div>
        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="ml-7 p-3 rounded-lg hover:bg-green-700 hover:text-white transition-colors cursor-pointer text-green-700 font-bold border-green-700 border-2">
            {isFetchingNextPage ? 'Loading...' : 'Show More'}
          </button>
        )}
      </div>
    </div>
  );
}
