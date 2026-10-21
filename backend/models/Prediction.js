const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: String, // optional, if you store image URL later
  prediction: {
    type: mongoose.Schema.Types.Mixed, // This allows storing any type of data
    required: true
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Prediction", predictionSchema);
