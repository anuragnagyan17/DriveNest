import axios from "axios";

export const getAIRecommendations = async (query) => {
  const { data } = await axios.post("/api/ai/recommend", { query });
  return data;
};
