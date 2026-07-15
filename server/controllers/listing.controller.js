import Listing from '../models/listing.model.js';
import User from '../models/user.model.js';
import { uploadBuffer } from '../utils/upload.js';
import {
  allListingsParamsSchema,
  createListingSchema,
  editListingSchema,
} from '../validation-schemas/listing.schema.js';
import { ApiResponse } from '../utils/response.js';
import { ApiError } from '../utils/error.js';
import { v2 as cloudinary } from 'cloudinary';

export async function createListing(req, res, next) {
  try {
    const { body, files } = req;
    const validation = createListingSchema.safeParse(body);
    if (!validation.success) {
      throw ApiError('Bad Request', 400);
    }
    if (!files) {
      throw ApiError('Listing Images are required', 400);
    }
    const newListing = new Listing();
    for (let key of Object.keys(body)) {
      newListing[key] = body[key];
    }
    newListing.user = req.userId;

    const images = await Promise.all(
      files.map(async file => {
        if (!file.mimetype.startsWith('image')) {
          throw ApiError('Invalid Attachment Provided!', 400);
          return;
        }
        const result = await uploadBuffer(file.buffer, {
          folder: 'realestate-mern',
          public_id: Date.now().toString(),
          overwrite: true,
        });
        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );

    newListing.images = images;
    await newListing.save();
    return ApiResponse(res, 200, 'Listing Created', newListing);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getUserListings(req, res, next) {
  try {
    const listings = await Listing.find({ user: req.userId });
    return ApiResponse(res, 200, 'Listings Fetched', listings);
  } catch (error) {
    next(error);
  }
}

export async function deleteListing(req, res, next) {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findOne({ _id: listingId });
    if (!listing) {
      throw ApiError('Listing not found', 404);
    }
    if (listing.user.toString() !== req.userId) {
      throw ApiError('Forbidden', 403);
    }
    // delete images
    if (listing.images.length > 0) {
      await Promise.all(
        listing.images.map(img => cloudinary.uploader.destroy(img.publicId)),
      );
    }
    await Listing.findByIdAndDelete(listingId);
    return ApiResponse(res, 200, 'Listing Deleted');
  } catch (error) {
    next(error);
  }
}

export async function updateListing(req, res, next) {
  try {
    const { body, files } = req;
    const validation = editListingSchema.safeParse(body);

    if (!validation.success) {
      throw ApiError('Bad Request', 400);
    }

    const existingListing = await Listing.findById(body.listingId);

    if (!existingListing) {
      throw ApiError('Listing Not Found', 404);
    }
    if (existingListing.user.toString() !== req.userId) {
      throw ApiError('Forbidden', 403);
    }

    for (let key of Object.keys(body)) {
      existingListing[key] = body[key];
    }

    if (req.files.length > 0) {
      // delete previous images
      if (existingListing.images.length > 0) {
        await Promise.all(
          existingListing.images.map(img =>
            cloudinary.uploader.destroy(img.publicId),
          ),
        );
      }
      // upload new images
      existingListing.images = await Promise.all(
        files.map(async file => {
          if (!file.mimetype.startsWith('image')) {
            throw ApiError('Invalid Attachment Provided!', 400);
            return;
          }
          const result = await uploadBuffer(file.buffer, {
            folder: 'realestate-mern',
            public_id: Date.now().toString(),
            overwrite: true,
          });
          return {
            url: result.secure_url,
            publicId: result.public_id,
          };
        }),
      );
    }

    await existingListing.save();
    return ApiResponse(res, 200, 'Listing Updated', existingListing);
  } catch (error) {
    next(error);
  }
}

export async function getSingleListing(req, res, next) {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw ApiError('Listing not found', 404);
    }
    return ApiResponse(res, 200, 'Listing Fetched', listing);
  } catch (error) {
    next(error);
  }
}

export async function getAllListings(req, res, next) {
  try {
    const listings = await Listing.find();
    return ApiResponse(res, 200, 'All listings Fetched', listings);
  } catch (error) {
    next(error);
  }
}

export async function searchAllListings(req, res, next) {
  try {
    const validation = allListingsParamsSchema.safeParse(req.query);
    if (!validation.success) {
      throw ApiError('Bad Request', 400);
    }
    let {
      query: searchQuery,
      type,
      discountOffered,
      parking,
      furnished,
      sortBy,
      order,
      page,
      limit,
    } = validation.data;

    const filters = { parking, furnished };

    if (searchQuery) {
      filters.title = { $regex: new RegExp(searchQuery, 'i') };
    }

    if (type === 'both') {
      filters.type = { $in: ['rental', 'for-sale'] };
    } else {
      filters.type = type;
    }

    if (discountOffered) {
      filters.discountPercentage = { $gt: 0 };
    } else {
      filters.discountPercentage = 0;
    }

    const skip = (page - 1) * limit;

    let listings = await Listing.find(filters)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit + 1);

    let hasMore = false;

    if (listings.length > limit) {
      hasMore = true;
      listings.pop();
    }

    return ApiResponse(res, 200, 'Listings Fetched', { listings, hasMore });
  } catch (error) {
    next(error);
  }
}
