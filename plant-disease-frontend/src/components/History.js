import React, { useEffect, useState, useContext } from "react";
import { authApi } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import { generateHistoryReport } from "../services/pdfService";
import "./History.css";

const History = () => {
  const { theme } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await authApi.get(`/api/predict/history?page=${page}&limit=${pagination.limit}`);
      
      console.log("History response:", res.data); // Debug log
      
      if (res.data && res.data.history) {
        setHistory(res.data.history);
        // Update pagination info from response
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Failed to load prediction history. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  // Function to generate PDF of history
  const handleGenerateReport = () => {
    if (history.length === 0) {
      setError("No predictions to generate report");
      return;
    }
    
    // Process history items to prepare for PDF generation
    const processedPredictions = history.map(item => {
      const predData = extractPredictionData(item);
      return {
        class: predData.className.replace(/_/g, ' ').replace(/___/g, ' - '),
        confidence: predData.confidence,
        description: predData.definition,
        treatment: predData.remedy,
        prevention: predData.cause,
        date: new Date(item.createdAt || item.date || Date.now()).toLocaleDateString(),
        imageData: predData.imageData
      };
    });
    
    generateHistoryReport(processedPredictions);
  };

  // Helper function to safely extract prediction data
  const extractPredictionData = (item) => {
    try {
      console.log("Extracting prediction data from:", item);
      
      // For newer predictions stored as objects
      if (item.prediction && typeof item.prediction === 'object') {
        const predictionData = {
          className: item.prediction.predicted_class || 'Unknown',
          confidence: item.prediction.confidence || 0,
          definition: item.prediction.definition || 'No definition available',
          cause: item.prediction.cause || 'Unknown cause',
          remedy: item.prediction.remedy || 'No remedy available',
          date: new Date(item.createdAt || Date.now()).toLocaleDateString()
        };

        // Handle image data - it could be in different places based on how it was saved
        if (item.prediction.imageData) {
          predictionData.imageData = item.prediction.imageData;
        } else if (item.imageUrl) {
          predictionData.imageData = item.imageUrl;
        }

        console.log("Extracted prediction data:", predictionData); // Debug log
        return predictionData;
      }
      
      // Fallback for other formats
      return {
        className: 'Unknown',
        confidence: 0,
        definition: 'No definition available',
        cause: 'Unknown cause',
        remedy: 'No remedy available',
        imageData: null,
        date: new Date(item.createdAt || Date.now()).toLocaleDateString()
      };
    } catch (e) {
      console.error("Error parsing prediction data:", e);
      return {
        className: 'Error parsing data',
        confidence: 0,
        definition: 'Error parsing data',
        cause: 'Error parsing data',
        remedy: 'Error parsing data',
        imageData: null,
        date: new Date().toLocaleDateString()
      };
    }
  };

  // Pagination UI component
  const PaginationControls = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          onClick={() => handlePageChange(1)}
          disabled={!pagination.hasPrevPage}
          className={`pagination-btn ${!pagination.hasPrevPage ? 'disabled' : ''}`}
        >
          «
        </button>
        
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrevPage}
          className={`pagination-btn ${!pagination.hasPrevPage ? 'disabled' : ''}`}
        >
          ‹
        </button>
        
        <div className="pagination-status">
          {pagination.page} / {pagination.totalPages}
        </div>
        
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className={`pagination-btn ${!pagination.hasNextPage ? 'disabled' : ''}`}
        >
          ›
        </button>
        
        <button
          onClick={() => handlePageChange(pagination.totalPages)}
          disabled={!pagination.hasNextPage}
          className={`pagination-btn ${!pagination.hasNextPage ? 'disabled' : ''}`}
        >
          »
        </button>
      </div>
    );
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <div className="loading-text">Loading your prediction history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon-large">⚠️</div>
        <div className="error-title">Error Loading History</div>
        <div>{error}</div>
      </div>
    );
  }

  if (history.length === 0 && !loading) {
    return (
      <div className="empty-history-container">
        <div className="empty-icon">📊</div>
        <div className="empty-title">No Predictions Yet</div>
        <div className="empty-message">
          Your prediction history will appear here after you upload and analyze plant images.
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2 className="history-title">Your Prediction History</h2>
          <p className="history-subtitle">
            Review your past plant disease predictions and treatments
          </p>
          {pagination.total > 0 && (
            <div className="history-count">
              Showing {history.length} of {pagination.total} predictions
            </div>
          )}
        </div>
        
        <button className="generate-report-btn" onClick={handleGenerateReport}>
          <span className="report-icon">📄</span>
          Save as PDF
        </button>
      </div>
      
      {loading && (
        <div className="loading-inline">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      <div className="history-grid">
        {history.map((item, index) => {
          const predictionData = extractPredictionData(item);
          const confidenceLevel = predictionData.confidence > 0.8 ? "High" : 
                                 predictionData.confidence > 0.5 ? "Medium" : "Low";
          const confidenceColor = 
                        predictionData.confidence > 0.8 ? "#388e3c" : 
                        predictionData.confidence > 0.5 ? "#f57c00" : "#d32f2f";
                        
          return (
            <div 
              key={index} 
              className="history-card"
            >
              <div className="history-card-header">
                <div className="history-card-title">
                  <div>{predictionData.className.replace(/_/g, ' ').replace(/___/g, ' - ')}</div>
                  <div className="history-card-date">{predictionData.date}</div>
                </div>
              </div>
              
              <div className="history-card-content">
                {predictionData.imageData && (
                  <div className="history-image-container">
                    <img 
                      src={predictionData.imageData}
                      alt="Plant"
                      className="history-image"
                      onError={(e) => {
                        console.error("Failed to load image:", e);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {predictionData.confidence > 0 && (
                  <div className="confidence-container">
                    <div className="confidence-label">Confidence:</div>
                    <div className="confidence-badge">
                      <div className="confidence-dot" style={{ backgroundColor: confidenceColor }}></div>
                      <span className="confidence-value">
                        {(predictionData.confidence * 100).toFixed(2)}% ({confidenceLevel})
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="definition-box">
                  <div className="definition-label">DEFINITION</div>
                  <div className="definition-text">{predictionData.definition}</div>
                </div>
                
                <div className="cause-box">
                  <h5 className="cause-label">
                    <span className="cause-icon">⚠</span>
                    CAUSE
                  </h5>
                  <p className="cause-text">{predictionData.cause}</p>
                </div>
                
                <div className="remedy-box">
                  <h5 className="remedy-label">
                    <span className="remedy-icon">💡</span>
                    REMEDY
                  </h5>
                  <p className="remedy-text">{predictionData.remedy}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <PaginationControls />
    </div>
  );
};

export default History;
