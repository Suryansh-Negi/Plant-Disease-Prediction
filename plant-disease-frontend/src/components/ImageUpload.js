// src/components/ImageUpload.js
import React, { useState, useRef, useContext } from "react";
import axios from "axios";
import { mlApi, authApi } from "../services/api";
import PredictionCard from "./PredictionCard";
import { ThemeContext } from "../context/ThemeContext";
import { toast } from 'react-toastify';
import "./ImageUpload.css";

const resizeImage = (base64Str, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = base64Str;
    img.onload = () => {
      // Check if resizing is needed
      if (img.width <= maxWidth && img.height <= maxHeight) {
        resolve(base64Str); // No need to resize
        return;
      }
      
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the data URL (default quality of 0.92)
      const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
      resolve(resizedBase64);
    };
  });
};

const ImageUpload = () => {
  const { theme } = useContext(ThemeContext);
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processSelectedFile(selectedFile);
  };

  const processSelectedFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setPrediction(null);
      setError("");
      toast.info('Image selected. Ready for analysis.');
      
      // Convert file to base64 for PDF generation
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first");
      toast.error("Please select an image first");
      return;
    }
    
    setLoading(true);
    setError("");
    setPrediction(null);  // Clear any previous prediction
    toast.info('Analyzing plant image...');
    
    try {
      // Create form data to send to Flask API
      const formData = new FormData();
      formData.append("file", file);
      
      // Always use direct upload to Flask API
      console.log("Uploading directly to Flask API");
      
      // Add timeout and error handling for the Flask API request
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000  // 30 second timeout
      });
      
      console.log("Direct Flask response:", response.data);
      
      // Check if there's a warning from low confidence
      if (response.data.warning) {
        setError(response.data.warning);
        toast.warning(response.data.warning);
      } else {
        toast.success('Plant analysis complete!');
      }
      
      // Format response to match frontend expectations
      const predictionData = {
        predicted_class: response.data.predicted_class,
        confidence: response.data.confidence,
        definition: response.data.definition,
        cause: response.data.cause,
        remedy: response.data.remedy,
        top_predictions: response.data.top_predictions || []
      };
      
      setPrediction(predictionData);
      
      // Convert image to base64 for storage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          console.log("Base64 image generated:", base64Image.substring(0, 50) + "..."); // Log part of base64 string
          
          // Resize the image to make it more manageable
          const resizedImage = await resizeImage(base64Image, 800, 800);
          console.log("Image processed for storage");
          
          // Create prediction data for history
          const historyData = {
            ...response.data,
            imageData: resizedImage
          };
          
          // Save to history through backend with image
          const saveResponse = await authApi.post("/api/predict/saveHistory", {
            prediction: historyData
          });
          
          console.log("Prediction saved to history with image:", saveResponse.data);
          toast.success('Prediction saved to history');
        } catch (historyErr) {
          console.error("Failed to save to history:", historyErr);
          setError(prev => prev ? `${prev}. Also, failed to save to history.` : "Failed to save to history.");
          toast.error("Failed to save to history");
        }
      };
    } catch (err) {
      console.error("Upload error:", err);
      
      // More detailed error handling
      let errorMessage = "Upload failed. ";
      
      if (err.response) {
        // Server responded with an error
        errorMessage += err.response.data?.error || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response
        errorMessage += "No response from the server. Please check if the Flask API is running.";
      } else {
        // Error setting up the request
        errorMessage += err.message || "Unknown error occurred";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plant-disease-container">
      <header className="prediction-header">
        <h1>Plant Disease Prediction</h1>
        <p>Upload a plant leaf image to identify diseases and get treatment recommendations</p>
      </header>

      <div className="prediction-content">
        <div className="upload-section">
          {/* Hidden file input */}
          <input 
            ref={fileInputRef}
            id="file-upload-input"
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <div 
            className={`drop-area ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            {!previewUrl ? (
              <div className="drop-message">
                <div className="upload-icon">📷</div>
                <p className="drop-title">Drag and drop your image here</p>
                <p className="drop-subtitle">or click to browse files</p>
              </div>
            ) : (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="image-preview"
              />
            )}
          </div>
          
          <button 
            className={`upload-btn ${loading ? 'loading' : ''} ${!file ? 'disabled' : ''}`}
            onClick={handleUpload} 
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Analyzing Image...
              </>
            ) : (
              "Identify Disease"
            )}
          </button>
        </div>

        {prediction && (
          <div className="prediction-section">
            <PredictionCard data={prediction} imageUrl={imageBase64} />
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
