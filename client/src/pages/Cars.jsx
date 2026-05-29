import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets, dummyCarData } from "../assets/assets";
import CarCard from "../components/CarCard";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import toast from "react-hot-toast";

const Cars = () => {
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const { cars, axios, pagination, fetchCars } = useAppContext();

  const [input, setInput] = useState("");

  const isSearchDate = pickupLocation && pickupDate && returnDate;
  const isLocationOnly = pickupLocation && !pickupDate && !returnDate;
  const [filteredCars, setFilteredCars] = useState([]);

  const applyFilter = () => {
    if (input === '') {
      setFilteredCars(cars);
      return;
    }
    const filtered = cars.filter((car) =>
      car.brand.toLowerCase().includes(input.toLowerCase()) ||
      car.model.toLowerCase().includes(input.toLowerCase()) ||
      car.category.toLowerCase().includes(input.toLowerCase()) ||
      car.transmission.toLowerCase().includes(input.toLowerCase()) ||
      car.location.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  const searchCarAvailability = async () => {
    const { data } = await axios.post("/api/bookings/check-availability", {
      location: pickupLocation,
      pickupDate,
      returnDate,
    });
    if (data.success) {
      setFilteredCars(data.availableCars);
      if (data.availableCars.length === 0) {
        toast("No cars available");
      }
      return null;
    }
  };

  useEffect(() => {
    if (isSearchDate) {
      searchCarAvailability();
    } else if (isLocationOnly) {
      fetchCars(1, pickupLocation);
    }
  }, []);

  useEffect(() => {
    if (!isSearchDate) {
      applyFilter();
    }
  }, [input, cars]);

  return (
    <div>
      <div className="flex flex-col items-center py-20 bg-slate-900 max-md:px-4">
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles available for your next adventure"
        />
        <div className="flex items-center bg-slate-800 px-4 mt-cd6 max-w-140 w-full h-12 rounded-full shadow">
          <img src={assets.search_icon} alt="" className="w-4.5 h-4.5 mr-2" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Search by make model, features"
            className="w-full h-full outline-none text-slate-400"
          />
          <img src={assets.filter_icon} alt="" className="w-4.5 h-4.5 ml-2" />
        </div>
      </div>

      <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10">
        <p className="text-slate-400 xl:px-20 max-w-7xl mx-auto">
          Showing {filteredCars.length} Cars
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
          {filteredCars.map((car, index) => (
            <div key={index}>
              <CarCard car={car} />
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-slate-400 text-lg">
              No cars found matching your search.
            </p>
            <button
              onClick={() => setInput('')}
              className="mt-4 text-primary underline text-sm cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {!isSearchDate && pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-10 mb-6">
            <button
              onClick={() => fetchCars(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-primary text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dull transition-all"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchCars(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-primary text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dull transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;
