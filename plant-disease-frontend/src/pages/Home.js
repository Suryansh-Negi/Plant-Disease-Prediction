// src/pages/Home.js
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const isAuthenticated = !!localStorage.getItem("token");
  
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
      {/* Hero section */}
      <div style={{
        display: "flex",
        flexDirection: window.innerWidth > 768 ? "row" : "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 0",
        gap: "40px"
      }}>
        <div style={{ flex: "1" }}>
          <h1 style={{ 
            fontSize: "2.5rem", 
            color: "#2e7d32",
            marginBottom: "20px",
            fontWeight: "700",
            lineHeight: "1.2"
          }}>
            Detect Plant Diseases with AI Technology
          </h1>
          <p style={{ 
            fontSize: "1.1rem", 
            color: "#555",
            marginBottom: "30px",
            lineHeight: "1.6"
          }}>
            Upload images of plant leaves and get instant analysis of potential diseases.
            Our AI model helps you identify issues early and provides treatment recommendations.
          </p>
          
          <div style={{ display: "flex", gap: "15px" }}>
            {isAuthenticated ? (
              <Link to="/upload" style={{
                backgroundColor: "#2e7d32",
                color: "white",
                padding: "12px 24px",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: "600",
                display: "inline-block",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                Start Diagnosis
              </Link>
            ) : (
              <>
                <Link to="/login" style={{
                  backgroundColor: "#2e7d32",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: "600",
                  display: "inline-block",
                  textAlign: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  Login
                </Link>
                <Link to="/register" style={{
                  border: "2px solid #2e7d32",
                  color: "#2e7d32",
                  padding: "12px 24px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: "600",
                  display: "inline-block",
                  textAlign: "center"
                }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div style={{ 
          flex: "1",
          display: "flex",
          justifyContent: "center"
        }}>
          <img 
            src="https://img.freepik.com/free-vector/scientist-researching-plant-illustration_1284-63876.jpg" 
            alt="Plant diagnosis illustration" 
            style={{ 
              maxWidth: "100%",
              borderRadius: "8px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
            }}
          />
        </div>
      </div>
      
      {/* Features section */}
      <div style={{ padding: "60px 0" }}>
        <h2 style={{ 
          textAlign: "center", 
          fontSize: "2rem", 
          color: "#333",
          marginBottom: "50px"
        }}>
          How It Works
        </h2>
        
        <div style={{ 
          display: "flex", 
          gap: "30px",
          flexDirection: window.innerWidth > 768 ? "row" : "column" 
        }}>
          {[
            {
              icon: "📷",
              title: "Upload Photo",
              desc: "Take a clear picture of the plant leaf showing signs of disease"
            },
            {
              icon: "🔬",
              title: "AI Analysis",
              desc: "Our machine learning model analyzes the image to identify disease patterns"
            },
            {
              icon: "💡",
              title: "Get Results",
              desc: "Receive detailed information about the disease and treatment options"
            }
          ].map((item, index) => (
            <div key={index} style={{
              flex: "1",
              backgroundColor: "#f9f9f9",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              textAlign: "center",
              transition: "transform 0.2s ease",
            }}>
              <div style={{ 
                fontSize: "3rem", 
                marginBottom: "15px" 
              }}>
                {item.icon}
              </div>
              <h3 style={{ 
                fontSize: "1.3rem", 
                marginBottom: "10px",
                color: "#2e7d32"
              }}>
                {item.title}
              </h3>
              <p style={{ color: "#666" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Call to action */}
      <div style={{
        backgroundColor: "#e8f5e9",
        borderRadius: "8px",
        padding: "50px 30px",
        textAlign: "center",
        marginBottom: "60px"
      }}>
        <h2 style={{ 
          fontSize: "1.8rem", 
          color: "#2e7d32",
          marginBottom: "20px" 
        }}>
          Ready to identify plant diseases?
        </h2>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#555",
          marginBottom: "30px",
          maxWidth: "600px",
          margin: "0 auto 30px"
        }}>
          Early detection is crucial for plant health. Start using our tool today to keep your plants thriving.
        </p>
        
        {isAuthenticated ? (
          <Link to="/upload" style={{
            backgroundColor: "#2e7d32",
            color: "white",
            padding: "12px 28px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-block",
            fontSize: "1.1rem"
          }}>
            Start Now
          </Link>
        ) : (
          <Link to="/register" style={{
            backgroundColor: "#2e7d32",
            color: "white",
            padding: "12px 28px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-block",
            fontSize: "1.1rem"
          }}>
            Create Account
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;
