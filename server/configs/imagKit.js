import ImageKit from "imagekit";
import fs from "fs";

// Lazy initialization - only create ImageKit instance if real keys are provided
const getImageKit = () => {
  if (
    !process.env.IMAGEKIT_PUBLIC_KEY ||
    process.env.IMAGEKIT_PUBLIC_KEY === "dummy_public_key"
  ) {
    return null;
  }
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
};

export const uploadToImageKit = async (filePath, fileName) => {
  const imagekit = getImageKit();
  
  if (!imagekit) {
    console.log("ImageKit not configured - using fallback image.");
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800";
  }

  const file = fs.readFileSync(filePath);
  const result = await imagekit.upload({
    file,
    fileName,
    folder: '/car-rental'
  });
  return result.url;
};

export default getImageKit;
