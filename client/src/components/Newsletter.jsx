import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../Context/AppContext";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { axios } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/newsletter/subscribe', { email });
      if (data.success) {
        toast.success('Subscribed successfully!');
        setEmail('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 max-md:px-4 my-10 mb-40">
      <h1 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h1>
      <p className="md:text-lg text-slate-400/70 pb-8">
        Subscribe to get the latest offers, new arrivals, and exclusive
        discounts
      </p>
      <form onSubmit={handleSubmit} className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
        <input
          className="border border-slate-600 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-slate-400"
          type="email"
          placeholder="Enter your email id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-600 transition-all cursor-pointer rounded-md rounded-l-none disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default Newsletter;
