import { MdLocationOn } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const formatPrice = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const discountedPrice =
    listing.price - (listing.price * listing.discountPercentage) / 100;
  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden rounded-lg w-full sm:w-72">
      <Link to={`/listings/${listing._id.toString()}`}>
        <img
          src={
            listing.images[0]?.url ??
            'https://placehold.co/1200x400?text=No+Image'
          }
          alt="listing cover"
          className="h-80 sm:h-55 w-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="text-lg font-semibold text-slate-700 truncate">
            {listing.title}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="size-4 text-green-700" />
            <p className="truncate text-sm text-slate-600 w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <div className="text-slate-500 mt-2 font-semibold flex gap-2 items-center">
            <span>
              {listing.discountPercentage > 0
                ? formatPrice(discountedPrice)
                : formatPrice(listing.price)}
              {listing.type === 'rental' && ' / month'}
            </span>
            {listing.discountPercentage > 0 && (
              <span className="text-xs line-through">${listing.price}</span>
            )}
          </div>
          <div className="flex gap-4 text-slate-800">
            <div className="font-bold text-xs">
              {listing.bedrooms}
              {listing.bedrooms > 1 ? ' bedrooms' : ' bedroom'}
            </div>
            <div className="font-bold text-xs">
              {listing.bathrooms}
              {listing.bathrooms > 1 ? ' bathrooms' : ' bathroom'}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
