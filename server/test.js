import connectDB from "./configs/mongodb.configs.js";
import User from "./models/user.model.js";
import "dotenv/config";
await connectDB();
const u = await User.create({name: "testg", email: "testg@test.com"});
console.log(u);
process.exit(0);
