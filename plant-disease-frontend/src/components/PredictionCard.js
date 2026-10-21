// src/components/PredictionCard.js
import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { generatePredictionReport } from "../services/pdfService";

const PredictionCard = ({ data, imageUrl }) => {
  const { theme } = useContext(ThemeContext);
  const { predicted_class, confidence, definition, cause, remedy, top_predictions } = data;
  
  const confidencePercent = confidence ? `${(confidence * 100).toFixed(2)}%` : 'N/A';
  const confidenceLevel = confidence ? 
    confidence > 0.8 ? "High" : 
    confidence > 0.5 ? "Medium" : "Low" 
    : "Unknown";
  
  const confidenceColor = 
    confidence > 0.8 ? "#388e3c" : 
    confidence > 0.5 ? "#f57c00" : "#d32f2f";

  // Display alternative predictions if available
  const hasAlternatives = top_predictions && top_predictions.length > 1;

  // Function to handle PDF report generation
  const handleGenerateReport = () => {
    // Format the prediction data for the PDF service
    const predictionForReport = {
      class: predicted_class.replace(/_/g, ' ').replace(/___/g, ' - '),
      confidence: confidence,
      description: definition,
      treatment: remedy,
      prevention: cause,
      alternativePredictions: top_predictions ? top_predictions.slice(1) : []
    };
    
    generatePredictionReport(predictionForReport, imageUrl);
  };

  return (
    <div
      className="card"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{
        backgroundColor: "var(--primary-color)",
        padding: "15px 20px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{
          margin: "0",
          fontSize: "1.3rem",
          fontWeight: "600"
        }}>Prediction Results</h3>
        
        <button
          onClick={handleGenerateReport}
          style={{
            backgroundColor: "white",
            color: "var(--primary-color)",
            border: "none",
            borderRadius: "4px",
            padding: "6px 12px",
            fontSize: "0.85rem",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span style={{ fontSize: "1rem" }}>📄</span>
          Save as PDF
        </button>
      </div>
      
      <div style={{ padding: "20px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <div style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(var(--primary-color-rgb), 0.1)",
            marginRight: "15px",
            fontSize: "2rem"
          }}>
            <span role="img" aria-label="plant">🌿</span>
          </div>
          <div>
            <h4 style={{
              margin: "0 0 5px 0",
              fontSize: "1.4rem",
              color: "var(--text-color)"
            }}>{predicted_class.replace(/_/g, ' ').replace(/___/g, ' - ')}</h4>
            <div style={{
              display: "flex",
              alignItems: "center"
            }}>
              <div style={{
                fontSize: "0.85rem",
                color: "var(--text-color)",
                opacity: 0.7,
                marginRight: "10px"
              }}>Confidence:</div>
              <div style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                borderRadius: "12px",
                padding: "3px 10px",
                display: "flex",
                alignItems: "center"
              }}>
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: confidenceColor,
                  marginRight: "6px"
                }}></div>
                <span style={{
                  fontSize: "0.85rem",
                  color: "var(--text-color)",
                  fontWeight: "500"
                }}>{confidencePercent} ({confidenceLevel})</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alternative predictions section */}
        {hasAlternatives && (
          <div style={{ 
            marginBottom: "20px",
            backgroundColor: "var(--surface-color)",
            padding: "10px 15px",
            borderRadius: "6px",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{
              fontSize: "0.85rem",
              color: "var(--text-color)",
              opacity: 0.7,
              marginBottom: "8px",
              fontWeight: "500"
            }}>Alternative possibilities:</div>
            {top_predictions.slice(1).map((pred, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 0",
                fontSize: "0.85rem",
                borderTop: index > 0 ? `1px solid var(--border-color)` : "none"
              }}>
                <span>{pred.class.replace(/_/g, ' ').replace(/___/g, ' - ')}</span>
                <span style={{ fontWeight: "500" }}>{(pred.confidence * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ 
          marginBottom: "15px",
          borderLeft: "3px solid var(--primary-color)",
          paddingLeft: "15px",
          backgroundColor: "rgba(var(--primary-color-rgb), 0.05)",
          padding: "12px 15px"
        }}>
          <div style={{ 
            color: "var(--primary-color)",
            fontWeight: "600",
            marginBottom: "4px",
            fontSize: "0.9rem"
          }}>DEFINITION</div>
          <div>{definition}</div>
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <h5 style={{
            fontSize: "1rem",
            margin: "0 0 8px 0",
            color: "var(--text-color)",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ marginRight: "8px", color: "#d32f2f" }}>⚠</span>
            Cause
          </h5>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>{cause}</p>
        </div>
        
        <div style={{ 
          backgroundColor: "rgba(var(--primary-color-rgb), 0.1)", 
          padding: "15px",
          borderRadius: "6px" 
        }}>
          <h5 style={{
            fontSize: "1rem",
            margin: "0 0 8px 0",
            color: "var(--primary-color)",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ marginRight: "8px" }}>💡</span>
            Recommended Treatment
          </h5>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.5" }}>{remedy}</p>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
