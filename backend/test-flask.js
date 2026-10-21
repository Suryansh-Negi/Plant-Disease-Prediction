// Test script to directly test Flask API communication
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Path to a test image file
const testImagePath = path.join(__dirname, '../images/test_leaf.JPG');

async function testFlaskAPI() {
  try {
    console.log('Testing Flask API with file:', testImagePath);
    
    // Check if the file exists
    if (!fs.existsSync(testImagePath)) {
      console.error('Test file not found:', testImagePath);
      return;
    }
    
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath));
    
    // Send request to Flask API directly
    console.log('Sending request to Flask API...');
    const response = await axios.post('http://localhost:5000/predict', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    console.log('Flask API Response:', response.data);
    
    if (response.data.predicted_class) {
      console.log('✅ Test successful! Flask API is working correctly.');
    } else {
      console.log('❌ Test failed. Flask API response is missing predicted_class.');
    }
  } catch (error) {
    console.error('❌ Error testing Flask API:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
testFlaskAPI(); 