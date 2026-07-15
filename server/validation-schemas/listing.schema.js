import z from 'zod';

export const createListingSchema = z.object({
  title: z
    .string()
    .min(10, 'Name must have 10 characters')
    .max(62, 'Name cannot exceed 62 characters'),
  description: z.string().nonempty('Description cannot be empty'),
  address: z.string().nonempty('Address cannot be empty'),
  type: z.enum(['rental', 'for-sale']),
  parking: z.coerce.boolean(),
  furnished: z.coerce.boolean(),
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
});

export const editListingSchema = z.object({
  listingId: z.string(),
  title: z
    .string()
    .min(10, 'Name must have 10 characters')
    .max(62, 'Name cannot exceed 62 characters'),
  description: z.string().nonempty('Description cannot be empty'),
  address: z.string().nonempty('Address cannot be empty'),
  type: z.enum(['rental', 'for-sale']),
  parking: z.coerce.boolean(),
  furnished: z.coerce.boolean(),
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
});

export const allListingsParamsSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['rental', 'for-sale', 'both']).default('both'),
  discountOffered: z
    .preprocess(val => val === 'true', z.boolean())
    .default(true),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(6),
  parking: z.preprocess(val => val === 'true', z.boolean()).default(true),
  furnished: z.preprocess(val => val === 'true', z.boolean()).default(true),
  sortBy: z.enum(['price', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
