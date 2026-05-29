import React, { useEffect, useState } from "react";
import { assets, dummyCarData } from "../../assets/assets";
import Title from "../../components/Title";
import { useAppContext } from "../../Context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ManageCars = () => {
  const { isOwner, axios } = useAppContext();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);

  const fetchOwnersCars = async () => {
    try {
      const { data } = await axios.get("/api/owner/cars");
      if (data.success) {
        toast.success("Total Cars List: " + data.cars.length);
        setCars(data.cars);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleAvilability = async (carId) => {
    try {
      const { data } = await axios.post("/api/owner/toggle-car", { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnersCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCar = async (carId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this car?"
      );
      if (!confirm) return null;
      const { data } = await axios.post("/api/owner/delete-car", { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnersCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isOwner && fetchOwnersCars();
  }, [isOwner]);
  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title={"Manage Cars"}
        subTitle={
          "View all listed cars, update their details, or remove them from the booking plateform."
        }
      />

      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead className="text-slate-400">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car, index) => (
              <tr key={index} className="border-t border-borderColor">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={car.image}
                    alt=""
                    className="h-12 w-12 aspect-square rounded-md object-cover"
                  />
                  <div className="max-md:hidden">
                    <p className="font-medium">
                      {car.brand} {car.model}
                    </p>
                    <p className="text-xs text-slate-400">
                      {car.seating_capacity} • {car.transmission}
                    </p>
                  </div>
                </td>

                <td className="p-3 max-md:hidden">{car.category}</td>
                <td className="p-3">
                  {import.meta.env.VITE_CURRENCY}
                  {car.pricePerDay}/day
                </td>
                <td className="p-3 max-md:hidden">
                  <span
                    onClick={() => toggleAvilability(car._id)}
                    className={`px-3 py-1 rounded-full text-xs cursor-pointer ${
                      car.isAvaliable
                        ? "bg-green-100 text-green-500"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {car.isAvaliable ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="flex items-center p-3 gap-2">
                  <img
                    onClick={() => navigate(`/owner/add-car?edit=${car._id}`)}
                    src={assets.edit_icon}
                    alt="Edit"
                    className="cursor-pointer h-5"
                  />
                  <img
                    onClick={() => deleteCar(car._id)}
                    src={assets.delete_icon}
                    alt="Delete"
                    className="cursor-pointer h-5"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCars;
