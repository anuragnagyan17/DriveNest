import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const FALLBACK_COUNTRIES = [
  { name: "India", flag: "" },
  { name: "United States", flag: "" },
  { name: "United Kingdom", flag: "" },
  { name: "United Arab Emirates", flag: "" },
  { name: "Australia", flag: "" },
  { name: "Canada", flag: "" },
  { name: "Germany", flag: "" },
  { name: "Singapore", flag: "" },
  { name: "France", flag: "" },
  { name: "Japan", flag: "" }
];

const LocationPicker = ({ country, city, onCountryChange, onCityChange }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const containerRef = useRef(null);
  const countrySearchRef = useRef(null);
  const citySearchRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setCountryOpen(false);
        setCityOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Focus search inputs when dropdown opens
  useEffect(() => {
    if (countryOpen && countrySearchRef.current) {
      countrySearchRef.current.focus();
    }
  }, [countryOpen]);

  useEffect(() => {
    if (cityOpen && citySearchRef.current) {
      citySearchRef.current.focus();
    }
  }, [cityOpen]);

  // Fetch Countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags");
        const data = await res.json();
        const sorted = data
          .map((c) => ({ name: c.name.common, flag: c.flags?.png || "" }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      } catch (error) {
        setCountries(FALLBACK_COUNTRIES);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch Cities when country changes
  useEffect(() => {
    if (!country) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch(`https://countriesnow.space/api/v0.1/countries/cities/q?country=${country}`);
        const data = await res.json();
        if (data.error) throw new Error(data.msg);
        const sorted = [...data.data].sort((a, b) => a.localeCompare(b));
        setCities(sorted);
      } catch (error) {
        toast.error("Could not load cities for " + country);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [country]);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectedCountryObj = countries.find((c) => c.name === country);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" ref={containerRef}>
      {/* Country Dropdown */}
      <div className="flex flex-col w-full relative">
        <label>Country</label>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setCountryOpen(!countryOpen);
            setCityOpen(false);
            setCountrySearch("");
          }}
          className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none bg-transparent cursor-pointer flex justify-between items-center"
        >
          <div className="flex items-center gap-2 truncate">
            {country ? (
              <>
                {selectedCountryObj?.flag && (
                  <img
                    src={selectedCountryObj.flag}
                    alt={country}
                    className="w-5 h-3.5 object-cover rounded-sm"
                  />
                )}
                <span className="text-slate-300 truncate">{country}</span>
              </>
            ) : (
              <span className="text-slate-500">🌍 Select Country</span>
            )}
          </div>
          <span className={`text-slate-500 text-xs transition-transform ${countryOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>

        {countryOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-borderColor rounded-lg shadow-xl overflow-hidden flex flex-col max-h-64">
            <div className="sticky top-0 bg-[#0a0a0a] p-2 border-b border-borderColor">
              <input
                ref={countrySearchRef}
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-borderColor rounded-md outline-none text-sm text-slate-300 focus:border-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingCountries ? (
                <div className="px-3 py-4 text-sm text-slate-500 text-center animate-pulse">
                  Loading countries...
                </div>
              ) : filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <div
                    key={c.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCountryChange(c.name);
                      setCountryOpen(false);
                      setCountrySearch("");
                    }}
                    className={`px-3 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                      country === c.name ? "bg-primary/20 text-white" : "text-slate-300 hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {c.flag && (
                        <img
                          src={c.flag}
                          alt={c.name}
                          className="w-5 h-3.5 object-cover rounded-sm"
                        />
                      )}
                      <span>{c.name}</span>
                    </div>
                    {country === c.name && <span className="text-primary">✓</span>}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-slate-500 text-center">No country found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* City Dropdown */}
      <div className="flex flex-col w-full relative">
        <label>City</label>
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!country) return;
            setCityOpen(!cityOpen);
            setCountryOpen(false);
            setCitySearch("");
          }}
          className={`px-3 py-2 mt-1 border border-borderColor rounded-md outline-none bg-transparent flex justify-between items-center transition-opacity ${
            !country ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
          }`}
        >
          <div className="flex items-center truncate text-slate-300">
            {loadingCities ? (
              <span className="text-slate-500 animate-pulse">Loading cities...</span>
            ) : city ? (
              <span className="truncate">{city}</span>
            ) : (
              <span className="text-slate-500">📍 Select City</span>
            )}
          </div>
          <span className={`text-slate-500 text-xs transition-transform ${cityOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>

        {cityOpen && country && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#0a0a0a] border border-borderColor rounded-lg shadow-xl overflow-hidden flex flex-col max-h-64">
            <div className="sticky top-0 bg-[#0a0a0a] p-2 border-b border-borderColor">
              <input
                ref={citySearchRef}
                type="text"
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-borderColor rounded-md outline-none text-sm text-slate-300 focus:border-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
              {!loadingCities && cities.length > 0 && (
                <div className="px-1 pt-2 pb-1 text-xs text-slate-500 font-medium text-center">
                  {filteredCities.length} cities available
                </div>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {loadingCities ? (
                <div className="px-3 py-4 text-sm text-slate-500 text-center animate-pulse">
                  Loading cities...
                </div>
              ) : filteredCities.length > 0 ? (
                filteredCities.map((c) => (
                  <div
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCityChange(c);
                      setCityOpen(false);
                      setCitySearch("");
                    }}
                    className={`px-3 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                      city === c ? "bg-primary/20 text-white" : "text-slate-300 hover:bg-primary/10"
                    }`}
                  >
                    <span>{c}</span>
                    {city === c && <span className="text-primary">✓</span>}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-sm text-slate-500 text-center">No cities found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
