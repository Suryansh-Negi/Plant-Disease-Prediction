const express = require("express");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const Prediction = require("../models/Prediction");
const sendToFlask = require("../utils/sendToFlask");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Helper function to clean up old prediction entries (older than 30 days)
const cleanupOldPredictions = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Prediction.deleteMany({ 
      createdAt: { $lt: thirtyDaysAgo } 
    });
    
    console.log(`Cleaned up ${result.deletedCount} predictions older than 30 days`);
  } catch (err) {
    console.error("Error during cleanup:", err);
  }
};

// Schedule cleanup to run once a day
// This runs the first time the server starts, then daily
let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Route to handle prediction
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    // Check if cleanup should run (daily)
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      await cleanupOldPredictions();
      lastCleanupTime = now;
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Log file info for debugging
    console.log("File received:", req.file.originalname, req.file.mimetype, req.file.size);
    
    const flaskResponse = await sendToFlask(req.file);
    const prediction = flaskResponse.prediction;

    // Save to DB
    await Prediction.create({
      user: req.user.id,
      prediction,
    });

    res.json({ prediction });
  } catch (err) {
    console.error("Predict error:", err.message);
    res.status(500).json({ error: "Prediction failed: " + err.message });
  }
});

// Route to save predictions from direct Flask uploads
router.post("/saveHistory", auth, async (req, res) => {
  try {
    // Check if cleanup should run (daily)
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      await cleanupOldPredictions();
      lastCleanupTime = now;
    }

    // Validate request body
    if (!req.body.prediction) {
      return res.status(400).json({ error: "Prediction data is required" });
    }

    // Log what's being saved
    console.log("Saving prediction to history. Keys:", Object.keys(req.body.prediction));
    
    // Check if the prediction data is too large
    const dataSize = JSON.stringify(req.body).length;
    console.log(`Prediction data size: ${(dataSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (dataSize > 15 * 1024 * 1024) { // If over 15MB
      console.warn("Warning: Very large payload detected");
    }

    // Ensure prediction data is properly structured with defaults
    const predictionData = req.body.prediction;
    
    // Add default values for any missing required fields
    const sanitizedData = {
      predicted_class: predictionData.predicted_class || "Unknown",
      confidence: predictionData.confidence || 0,
      definition: predictionData.definition || "No definition available",
      cause: predictionData.cause || "Unknown cause",
      remedy: predictionData.remedy || "No remedy available"
    };
    
    // Preserve image data if available
    if (predictionData.imageData) {
      // Check if imageData is a proper base64 string
      if (typeof predictionData.imageData === 'string' && 
          predictionData.imageData.startsWith('data:image')) {
        sanitizedData.imageData = predictionData.imageData;
        console.log("Image data included in prediction");
      } else {
        console.warn("Invalid image data format");
      }
    }
    
    // Preserve top predictions if available
    if (predictionData.top_predictions) {
      sanitizedData.top_predictions = predictionData.top_predictions;
    }
    
    // Preserve any additional data that might be useful
    if (predictionData.warning) {
      sanitizedData.warning = predictionData.warning;
    }

    // Save sanitized data to DB
    const predictionRecord = await Prediction.create({
      user: req.user.id,
      prediction: sanitizedData,
    });

    console.log("Prediction saved with ID:", predictionRecord._id);

    res.json({ 
      success: true, 
      message: "Prediction saved to history",
      predictionId: predictionRecord._id
    });
  } catch (err) {
    console.error("Save history error:", err.message);
    if (err.name === 'MongooseError' || err.name === 'MongoError') {
      console.error("MongoDB error details:", err.code);
    }
    res.status(500).json({ error: "Failed to save prediction: " + err.message });
  }
});

// Add history endpoint with pagination
router.get("/history", auth, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Current page (default: 1)
    const limit = parseInt(req.query.limit) || 6; // Items per page (default: 6)
    const skip = (page - 1) * limit;
    
    // Get paginated predictions for the user
    const history = await Prediction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log("History results:", JSON.stringify(history, null, 2)); // Debug log
    
    // Get total count for pagination info
    const total = await Prediction.countDocuments({ user: req.user.id });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({ 
      history,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ error: "Failed to fetch prediction history" });
  }
});

module.exports = router;
