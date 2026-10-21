const axios = require("axios");
const FormData = require("form-data");

/**
 * Send file to Flask API for prediction
 * @param {Object} file - Multer file object
 * @returns {Promise} - Promise resolving to prediction data
 */
module.exports = async function sendToFlask(file) {
  try {
    // Create a new FormData instance
    const form = new FormData();
    
    // Append the file buffer with original filename
    form.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });
    
    // Default Flask API URL if not specified in env
    const flaskUrl = process.env.FLASK_URL || "http://localhost:5000/predict";
    
    console.log(`Sending file to Flask API: ${flaskUrl}`);
    
    // Send POST request to Flask
    const response = await axios.post(flaskUrl, form, {
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log("Flask API response:", response.data);
    
    // Verify the response contains the expected data
    if (!response.data || 
        !response.data.predicted_class || 
        response.data.confidence === undefined) {
      throw new Error("Invalid response from prediction service");
    }
    
    // Format response to match what frontend expects
    return {
      prediction: {
        predicted_class: response.data.predicted_class,
        confidence: response.data.confidence,
        definition: response.data.definition || "No definition available",
        cause: response.data.cause || "Unknown cause",
        remedy: response.data.remedy || "No remedy available"
      }
    };
  } catch (error) {
    console.error("Error sending to Flask:", error.message);
    if (error.response) {
      console.error("Flask API error response:", error.response.data);
    }
    throw new Error("Failed to communicate with prediction service: " + error.message);
  }
};
