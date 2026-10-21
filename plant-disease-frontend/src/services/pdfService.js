/**
 * Generate a PDF report for a disease prediction
 * @param {Object} prediction - The prediction data
 * @param {String} imageDataUrl - The base64 image data URL
 */
export const generatePredictionReport = (prediction, imageDataUrl) => {
  // Use the global jsPDF from the CDN
  const { jsPDF } = window.jspdf;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const imageMaxWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Add the title
  doc.setFontSize(22);
  doc.setTextColor(76, 175, 80); // Use primary color
  doc.text('Plant Disease Prediction Report', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Add the date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date();
  doc.text(`Generated on: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Add the image
  if (imageDataUrl) {
    try {
      const imgProps = doc.getImageProperties(imageDataUrl);
      const imgWidth = Math.min(imageMaxWidth, imgProps.width);
      const imgHeight = imgProps.height * (imgWidth / imgProps.width);
      
      doc.addImage(
        imageDataUrl, 
        'JPEG', 
        (pageWidth - imgWidth) / 2, 
        currentY, 
        imgWidth, 
        imgHeight
      );
      
      currentY += imgHeight + 15;
    } catch (e) {
      console.error("Error adding image to PDF:", e);
      doc.text("Image could not be added to the report", margin, currentY);
      currentY += 10;
    }
  }

  // Add disease name as a main heading
  if (prediction.class) {
    doc.setFontSize(18);
    doc.setTextColor(76, 175, 80);
    doc.text(prediction.class, pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;
  }

  // Add prediction details section
  doc.setFontSize(16);
  doc.setTextColor(76, 175, 80);
  doc.text('Prediction Results', margin, currentY);
  currentY += 10;

  // Format prediction data for table
  let tableData = [];
  
  if (prediction.class) {
    // Format for new prediction structure
    tableData = [
      ['Disease', prediction.class || 'Unknown'],
      ['Confidence', `${Math.round((prediction.confidence || 0) * 100)}%`]
    ];
  } else {
    tableData = [['No prediction data available', '']];
  }

  // Add the prediction data table
  doc.autoTable({
    startY: currentY,
    head: [], // No header for this table
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [76, 175, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      cellPadding: 5,
      fontSize: 12,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 245, 245] }
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto'
  });
  
  currentY = doc.lastAutoTable.finalY + 15;

  // Add description if available
  if (prediction.description) {
    doc.setFontSize(14);
    doc.setTextColor(76, 175, 80);
    doc.text('Disease Description', margin, currentY);
    currentY += 7;
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const splitDescription = doc.splitTextToSize(prediction.description, pageWidth - (margin * 2));
    doc.text(splitDescription, margin, currentY);
    currentY += splitDescription.length * 7 + 15;
  }

  // Add treatment recommendations if available
  if (prediction.treatment) {
    doc.setFontSize(14);
    doc.setTextColor(76, 175, 80);
    doc.text('Treatment Recommendations', margin, currentY);
    currentY += 7;
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const splitTreatment = doc.splitTextToSize(prediction.treatment, pageWidth - (margin * 2));
    doc.text(splitTreatment, margin, currentY);
    currentY += splitTreatment.length * 7 + 15;
  }

  // Add prevention tips if available
  if (prediction.prevention) {
    doc.setFontSize(14);
    doc.setTextColor(76, 175, 80);
    doc.text('Prevention Tips', margin, currentY);
    currentY += 7;
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    const splitPrevention = doc.splitTextToSize(prediction.prevention, pageWidth - (margin * 2));
    doc.text(splitPrevention, margin, currentY);
  }

  // Add footer
  const footerY = pageHeight - 10;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Plant Disease Detection System - Generated Report', pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  const fileName = `plant-disease-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};

/**
 * Generate a PDF report with multiple predictions (history)
 * @param {Array} predictions - Array of prediction data
 */
export const generateHistoryReport = (predictions) => {
  if (!predictions || predictions.length === 0) {
    console.error("No predictions to generate report");
    return;
  }

  // Use the global jsPDF from the CDN
  const { jsPDF } = window.jspdf;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let currentY = margin;

  // Add the title
  doc.setFontSize(22);
  doc.setTextColor(76, 175, 80);
  doc.text('Plant Disease Prediction History', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Add the date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const currentDate = new Date();
  doc.text(`Generated on: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Add summary information
  doc.setFontSize(14);
  doc.setTextColor(76, 175, 80);
  doc.text(`Total Predictions: ${predictions.length}`, margin, currentY);
  currentY += 15;

  // Format prediction data for table
  const tableData = predictions.map((prediction, index) => {
    // Handle different prediction formats
    if (prediction.class) {
      // New format
      return [
        index + 1,
        prediction.class || 'Unknown',
        `${Math.round((prediction.confidence || 0) * 100)}%`,
        prediction.date || new Date().toLocaleDateString()
      ];
    } else if (prediction.predictions && prediction.predictions.length > 0) {
      // Legacy format
      const topPrediction = prediction.predictions[0];
      return [
        index + 1,
        topPrediction.class || 'Unknown',
        `${Math.round((topPrediction.confidence || 0) * 100)}%`,
        prediction.date || new Date().toLocaleDateString()
      ];
    } else {
      return [index + 1, 'Unknown', 'N/A', prediction.date || new Date().toLocaleDateString()];
    }
  });

  // Add the predictions table
  doc.autoTable({
    startY: currentY,
    head: [['#', 'Disease', 'Confidence', 'Date']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [76, 175, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      cellPadding: 5,
      fontSize: 12,
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { left: margin, right: margin }
  });

  // Add footer
  const footerY = pageHeight - 10;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Plant Disease Detection System - History Report', pageWidth / 2, footerY, { align: 'center' });

  // Save the PDF
  const fileName = `plant-disease-history-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}; 