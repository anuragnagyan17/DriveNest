import React, { useState } from "react";
import Hero from "../components/Hero";
import CarCard from "../components/CarCard";
import FeatureSection from "../components/FeatureSection";
import Banner from "../components/Banner";
import Testinomials from "../components/Testinomials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";

const Home = () => {
  const [car, setCar] = useState(null);
  const { recentCars } = useAppContext();
  const navigate = useNavigate();

  return (
    <div>
      <Hero />
      <FeatureSection />
      
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-16">
        <Title
          title="Recently Added Cars"
          subTitle="Explore the latest cars listed on our platform"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 max-w-7xl mx-auto">
          {recentCars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
        {recentCars.length === 0 && (
          <p className="text-slate-400 text-center mt-8">
            No cars available yet.
          </p>
        )}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate('/cars')}
            className="bg-primary hover:bg-primary-dull transition-all text-white px-8 py-3 rounded-xl font-medium cursor-pointer"
          >
            Explore All Cars
          </button>
        </div>
      </div>

      <Banner />
      <Testinomials />
      <Newsletter />
    </div>
  );
};

export default Home;
