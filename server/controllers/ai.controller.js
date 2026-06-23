import getGeminiModel from "../configs/gemini.js";
import Car from "../models/car.model.js";

export const extractFilters = async (userQuery) => {
  try {
    const model = getGeminiModel();
    if (!model) {
      console.log("Gemini model not initialized.");
      return {};
    }

    const prompt = `You are a filter-extraction engine for a car rental app. Convert the user's natural language request into STRICT JSON only. No markdown formatting, no code fences, no explanation text — return ONLY the raw JSON object.

Extract these fields if mentioned (omit any field not mentioned or unclear, do not guess):
- category: one of "Sedan", "SUV", "Hatchback", "Van" (match closest if user implies a type, e.g. "family trip" → "SUV")
- seating_capacity: number (e.g. "7-seater" → 7)
- fuel_type: one of "Petrol", "Diesel", "Electric", "Hybrid"
- transmission: one of "Manual", "Automatic"
- maxPricePerDay: number (extract from budget mentions like "under 3000" or "₹3000/day")
- location: string (city/area name if mentioned)

Examples:

Input: "need a 7-seater for a hill trip under 3000 a day, automatic"
Output: {"category":"SUV","seating_capacity":7,"transmission":"Automatic","maxPricePerDay":3000}

Input: "cheap automatic car in Delhi"
Output: {"transmission":"Automatic","location":"Delhi"}

Input: "looking for something nice"
Output: {}

Now extract from this input:
"${userQuery}"`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Strip markdown code fences if Gemini adds them anyway
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error extracting filters with Gemini:", error);
    return {};
  }
};

const buildMongoQuery = (filters) => {
  const query = { isAvaliable: true };

  if (filters.maxPricePerDay !== undefined && filters.maxPricePerDay !== null) {
    query.pricePerDay = { $lte: filters.maxPricePerDay };
  }
  if (filters.seating_capacity !== undefined && filters.seating_capacity !== null) {
    query.seating_capacity = filters.seating_capacity;
  }
  if (filters.category) {
    query.category = new RegExp(filters.category, "i");
  }
  if (filters.fuel_type) {
    query.fuel_type = new RegExp(filters.fuel_type, "i");
  }
  if (filters.transmission) {
    query.transmission = new RegExp(filters.transmission, "i");
  }
  if (filters.location) {
    query.location = new RegExp(filters.location, "i");
  }

  return query;
};

const rankAndExplain = async (userQuery, matchedCars) => {
  try {
    const model = getGeminiModel();
    if (!model) {
      throw new Error("Gemini model not initialized.");
    }

    const carsData = matchedCars.map(c => ({
      _id: c._id.toString(),
      brand: c.brand,
      model: c.model,
      year: c.year,
      category: c.category,
      seating_capacity: c.seating_capacity,
      fuel_type: c.fuel_type,
      transmission: c.transmission,
      pricePerDay: c.pricePerDay,
      location: c.location,
      features: c.features
    }));

    const prompt = `You are a car rental recommendation engine. Given a user's request and a list of available cars, pick the top 3 best matches and explain each choice briefly.

Return ONLY strict JSON — no markdown, no code fences, no explanation text outside the JSON.

Response format:
{
  "recommendations": [
    { "carId": "<MongoDB _id as string>", "reason": "<one sentence, max 15 words, why this car fits the request>" },
    { "carId": "...", "reason": "..." },
    { "carId": "...", "reason": "..." }
  ],
  "message": "<one friendly sentence to show to the user summarizing what you found, or explaining if nothing matched well>"
}

If fewer than 3 cars are provided, return only as many as are available.
If the list is empty, return { "recommendations": [], "message": "No cars found matching your request. Try adjusting your filters." }

User request: "${userQuery}"

Available cars:
${JSON.stringify(carsData)}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error ranking with Gemini:", error);
    return {
      recommendations: matchedCars.slice(0, 3).map(c => ({
        carId: c._id.toString(),
        reason: "Matches your search criteria"
      })),
      message: "Here are the top matches for your search."
    };
  }
};

export const recommendCars = async (req, res) => {
  try {
    const userQuery = req.body.query;
    if (!userQuery || userQuery.trim() === "") {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const filters = await extractFilters(userQuery);
    let mongoQuery = buildMongoQuery(filters);
    
    let matchedCars = await Car.find(mongoQuery).limit(10).lean();

    // Fallback if 0 results and filters not empty
    if (matchedCars.length === 0 && Object.keys(filters).length > 0) {
      matchedCars = await Car.find({ isAvaliable: true }).limit(10).lean();
    }

    const aiResponse = await rankAndExplain(userQuery, matchedCars);

    const recommendations = aiResponse.recommendations.map(rec => {
      const car = matchedCars.find(c => c._id.toString() === rec.carId);
      return {
        car,
        reason: rec.reason,
        carId: rec.carId
      };
    }).filter(rec => rec.car); // filter out any mis-matched IDs just in case

    return res.status(200).json({
      success: true,
      message: aiResponse.message,
      filters,
      recommendations
    });

  } catch (error) {
    console.error("Error in recommendCars:", error);
    return res.status(500).json({ success: false, message: "AI recommendation failed, please try again" });
  }
};
