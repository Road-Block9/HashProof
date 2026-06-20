const express = require("express");
const cors = require("cors");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

const sendResponse = (res, statusCode, success, message, data = {}) => {
  return res.status(statusCode).json({ success, message, data });
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return sendResponse(res, 200, true, "Document Authentication API is running");
});

app.use("/api/documents", documentRoutes);

app.use((req, res) => {
  return sendResponse(res, 404, false, "Route not found");
});

app.use((error, req, res, next) => {
  if (error.name === "MulterError") {
    const message = error.code === "LIMIT_FILE_SIZE" ? "File size must not exceed 10 MB" : error.message;
    return sendResponse(res, 400, false, message);
  }

  if (error.message === "Only PDF files are allowed") {
    return sendResponse(res, 400, false, error.message);
  }

  console.error(error);
  return sendResponse(res, 500, false, "Internal server error");
});

module.exports = app;
