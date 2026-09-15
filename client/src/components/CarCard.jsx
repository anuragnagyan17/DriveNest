import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/reviews/${car._id}`);
        if (data.success) {
          setAvgRating(data.avgRating);
          setTotalReviews(data.totalReviews);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, [car._id, axios]);

  return (
    <div
      onClick={() => {
        navigate(`/car-details/${car._id}`);
        scrollTo(0, 0);
      }}
      className="group rounded-xl overflow-hidden shadow-lg hover:translate-y-1 transition-all duration-500 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="relative">
          <img
            src={car.image}
            alt={car.brand + ' ' + car.model}
            className="w-full h-48 object-cover"
          />
          <span
            className={`absolute top-3 right-3 px-2.5 py-1
              text-xs font-medium rounded-full
              ${car.isAvaliable
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
          >
            {car.isAvaliable ? 'Available' : 'Unavailable'}
          </span>
        </div>



        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
          <span className="font-semibold">
            {currency}
            {car.pricePerDay}
          </span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">
              {car.brand}
              {car.model}
            </h3>
            <p className="text-sm mt-1">
              <span className="text-yellow-400">★</span> {avgRating > 0 ? avgRating : "New"} 
              {totalReviews > 0 ? ` (${totalReviews})` : ""}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {car.category} • {car.year}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-2 text-slate-300">
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.users_icon} alt="" className="h-4 mr-2" />
            <span>{car.seating_capacity} Seats</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.fuel_icon} alt="" className="h-4 mr-2" />
            <span>{car.fuel_type}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.carIcon} alt="" className="h-4 mr-2" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <img src={assets.location_icon} alt="" className="h-4 mr-2" />
            <span>{car.location}{car.country ? `, ${car.country}` : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
