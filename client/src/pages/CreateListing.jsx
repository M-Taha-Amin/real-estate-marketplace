import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const createListingSchema = z.object({
  title: z
    .string()
    .min(10, 'Name must have 10 characters')
    .max(62, 'Name cannot exceed 62 characters'),
  description: z.string().nonempty('Description cannot be empty'),
  address: z.string().nonempty('Address cannot be empty'),
  type: z.enum(['rental', 'for-sale']),
  parking: z.boolean(),
  furnished: z.boolean(),
  bedrooms: z.coerce
    .number()
    .min(1, 'Must have 1 bedroom atleast')
    .max(25, 'Cannot exceed 25 bedrooms'),
  bathrooms: z.coerce
    .number()
    .min(1, 'Must have 1 bathroom atleast')
    .max(10, 'Cannot exceed 10 bathrooms'),
  price: z.coerce
    .number()
    .min(1, 'Price must be valid')
    .max(10000000, 'Price cannot exceed 10 million'),
  discountPercentage: z.coerce
    .number()
    .min(0, 'Discount must be between 0-100')
    .max(100, 'Discount must be between 0-100')
    .default(0),
  images: z
    .instanceof(FileList)
    .refine(files => files.length > 0, 'At least one image is required')
    .refine(files => files.length <= 3, 'Maximum 3 images allowed')
    .refine(
      files => Array.from(files).every(file => file.size <= 2 * 1024 * 1024),
      'Every image must be 2mb or smaller',
    ),
});

export default function CreateListing() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createListingSchema),
  });
  const [previews, setPreviews] = useState([]);
  const navigate = useNavigate();
  const createListingMutation = useMutation({
    mutationFn: async formData => {
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      return responseData.payload;
    },
    onSuccess: newListing => {
      return navigate('/listings/' + newListing._id);
    },
  });

  const images = watch('images');
  const type = watch('type');

  useEffect(() => {
    if (!images || images.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = Array.from(images).map(imgFile =>
      URL.createObjectURL(imgFile),
    );
    setPreviews(urls);
    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, [images]);

  function onSubmit(data) {
    const requestPayload = new FormData();
    for (let key of Object.keys(data)) {
      if (key === 'images') {
        Array.from(data[key]).forEach(file => {
          requestPayload.append('images', file);
        });
        continue;
      }
      requestPayload.append(key, data[key]);
    }
    toast.promise(createListingMutation.mutateAsync(requestPayload), {
      loading: 'Creating Listing...',
      success: 'Listing Added',
      error: err => err.message,
    });
  }

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form
        id="createListingForm"
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
        className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Listing Title..."
            className="p-3 rounded-lg bg-white"
            {...register('title')}
          />
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.title?.message}
          </p>
          <textarea
            type="text"
            placeholder="Listing Description..."
            className="p-3 rounded-lg bg-white"
            {...register('description')}
          />
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.description?.message}
          </p>
          <input
            type="text"
            placeholder="Listing Address..."
            className="p-3 rounded-lg bg-white"
            {...register('address')}
          />
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.address?.message}
          </p>
          <div className="flex gap-x-4 flex-wrap">
            <span className="font-semibold">Sale or Rent Property:</span>
            <div className="space-x-1">
              <input
                type="radio"
                id="for-sale"
                value="for-sale"
                {...register('type')}
              />
              <label htmlFor="for-sale">For-Sale</label>
            </div>
            <div className="space-x-1">
              <input
                defaultChecked
                type="radio"
                id="rental"
                value="rental"
                {...register('type')}
              />
              <label htmlFor="rental">Rental</label>
            </div>
          </div>
          <div className="flex gap-x-4 flex-wrap">
            <div className="space-x-1.5">
              <input type="checkbox" {...register('parking')} id="parking" />
              <label htmlFor="parking">Parking Spot</label>
            </div>
            <div className="space-x-1.5">
              <input
                type="checkbox"
                id="furnished"
                {...register('furnished')}
              />
              <label htmlFor="furnished">Furnished</label>
            </div>
          </div>
          <div className="flex gap-y-2 gap-x-8 flex-wrap">
            <div className="space-x-2">
              <input
                className="bg-white p-3 w-20 rounded-lg"
                type="number"
                id="bedrooms"
                defaultValue="1"
                {...register('bedrooms')}
              />
              <label htmlFor="bedrooms">Bedrooms</label>
            </div>
            <div className="space-x-2">
              <input
                className="bg-white p-3 w-20 rounded-lg"
                type="number"
                id="bathrooms"
                defaultValue="1"
                {...register('bathrooms')}
              />
              <label htmlFor="bathrooms">Bathrooms</label>
            </div>
          </div>
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.bedrooms?.message}
          </p>
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.bathrooms?.message}
          </p>
          <div className="flex gap-y-2 gap-x-12 flex-wrap">
            <div className="flex items-center gap-x-2 flex-wrap">
              <input
                className="bg-white p-3 w-20 rounded-lg"
                type="number"
                id="price"
                defaultValue="100"
                {...register('price')}
              />
              <div className="flex flex-col">
                <label htmlFor="price" className="text-center">
                  Price
                </label>
                {type === 'rental' && (
                  <span className="text-xs">($ / month)</span>
                )}
              </div>
            </div>
            <div className="space-x-2">
              <input
                className="bg-white p-3 w-20 rounded-lg"
                type="number"
                id="discount"
                defaultValue="0"
                {...register('discountPercentage')}
              />
              <label htmlFor="discount">Discount %</label>
            </div>
          </div>
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.price?.message}
          </p>
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.discountPercentage?.message}
          </p>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="text-gray-600">
            <span className="font-semibold mr-2 text-black">Images:</span>The
            first image will be the cover (max 3)
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
              {...register('images')}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previews.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="h-24 w-full rounded object-cover"
                />
              </div>
            ))}
          </div>
          <p className="-mt-3 text-xs text-red-500 font-bold">
            {errors.images?.message}
          </p>
          <button
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 cursor-pointer"
            type="submit"
            form="createListingForm">
            Create Listing
          </button>
        </div>
      </form>
    </main>
  );
}
