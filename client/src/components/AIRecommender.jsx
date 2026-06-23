import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getAIRecommendations } from "../api/ai";
import CarCard from "./CarCard";
import { useLocation } from "react-router-dom";

const AIRecommender = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const location = useLocation();

  const loadingMessages = [
    "Thinking...",
    "Checking inventory...",
    "Finding best matches...",
    "Almost there..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[index]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (location.pathname.startsWith("/owner")) {
    return null;
  }

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      toast.error("Please describe what you're looking for");
      return;
    }

    setLoading(true);
    setResults([]);
    setMessage("");
    if (searchQuery) setQuery(searchQuery);

    try {
      const data = await getAIRecommendations(q);
      if (data.success) {
        setResults(data.recommendations || []);
        setMessage(data.message || "");
      } else {
        toast.error("Could not get recommendations. Please try again.");
      }
    } catch (error) {
      toast.error("Could not get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults([]);
    setMessage("");
    setQuery("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary-dull text-white px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <span>✨</span>
        <span className="font-medium">AI Assist</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 md:bottom-20 right-6 z-50 w-[calc(100vw-3rem)] md:w-full max-w-[420px] max-h-[80vh] flex flex-col bg-[#0a0a0a] border border-borderColor rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-borderColor bg-black/40">
        <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
          <span>✨</span> AI Car Finder
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Results Area */}
        {results.length > 0 ? (
          <div className="flex flex-col gap-4">
            {message && (
              <p className="text-sm text-slate-300 italic mb-2 border-l-2 border-primary pl-3">
                {message}
              </p>
            )}
            
            <div className="flex flex-col gap-6">
              {results.map((result, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <CarCard car={result.car} />
                  <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                    <p className="text-sm text-primary">✦ {result.reason}</p>
                  </div>
                  {index < results.length - 1 && (
                    <hr className="border-borderColor mt-2" />
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={handleClear}
              className="text-sm text-slate-400 hover:text-white text-center mt-4 transition-colors"
            >
              Clear results
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {message && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{message}</p>
                <p className="text-xs text-slate-400 mt-1">No matches found. Try a broader search.</p>
              </div>
            )}

            {/* Example Chips */}
            {!loading && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-400">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "7-seater SUV under ₹3000",
                    "Cheap automatic car",
                    "Electric car in Delhi",
                    "Family weekend trip"
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSearch(chip)}
                      className="text-xs text-left bg-slate-800/50 hover:bg-primary/20 border border-borderColor hover:border-primary/50 text-slate-300 px-3 py-2 rounded-full transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-borderColor bg-black/20">
        <div className="flex flex-col gap-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="e.g. Need a 7-seater for a hill trip under ₹3000/day, automatic..."
            className="w-full bg-transparent border border-borderColor rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-primary resize-none"
            rows={3}
            disabled={loading}
          />
          <div className="flex items-center justify-between">
            <div className="text-sm text-primary font-medium pl-1">
              {loading && <span className="animate-pulse">{loadingText}</span>}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-primary hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Find My Car →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommender;
