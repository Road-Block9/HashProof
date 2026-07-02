require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { getCloudinaryConfigStatus } = require("./config/cloudinary");

const PORT = process.env.PORT || 5000;
const cloudinaryStatus = getCloudinaryConfigStatus();

console.log(`Cloudinary configured: ${cloudinaryStatus.configured}`);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
