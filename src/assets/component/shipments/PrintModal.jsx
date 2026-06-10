import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FaSpinner } from 'react-icons/fa';
import tofar from '../../images/tofar.png'

export default function PrintModalContent({ shipment, onClose }) {
  const printRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(true);

  // Dynamically load the external scripts
  useEffect(() => {
    // Function to load a single script
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load both scripts in parallel
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
    ])
    .then(() => {
      console.log("PDF libraries loaded successfully.");
      setIsScriptLoading(false);
    })
    .catch((error) => {
      console.error("Failed to load PDF libraries:", error);
    });
  }, []);

  const convertOklchToHex = (oklchColor) => {
    // oklch(0.5 0.1 240) format
    // For simplicity, map common oklch colors to hex equivalents
    const oklchToHexMap = {
      'oklch(0.5 0.1 240)': '#3053e0',
      'oklch(0.7 0.2 240)': '#5a7fee',
      'oklch(0.9 0.15 240)': '#a8bfff',
      'oklch(0.95 0.1 240)': '#e0e7ff',
      'oklch(0.55 0.15 240)': '#1e40af',
      'oklch(0.65 0.2 240)': '#1e3a8a',
      'oklch(0.75 0.18 240)': '#3b82f6',
    };
    
    // Try exact match first
    for (const [oklch, hex] of Object.entries(oklchToHexMap)) {
      if (oklchColor.includes(oklch)) return hex;
    }
    
    // Extract oklch components and convert based on lightness and hue
    const match = oklchColor.match(/oklch\s*\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+)?\s*\)/i);
    if (match) {
      const lightness = parseFloat(match[1]);
      const saturation = parseFloat(match[2]);
      const hue = parseFloat(match[3]);
      
      // Handle grayscale (low saturation)
      if (saturation < 0.05) {
        if (lightness > 0.9) return '#f3f4f6';
        if (lightness > 0.8) return '#e5e7eb';
        if (lightness > 0.5) return '#9ca3af';
        return '#4b5563';
      }
      
      // Blue hues (around 240)
      if (hue >= 200 && hue <= 280) {
        if (lightness > 0.8) return '#dbeafe';
        if (lightness > 0.7) return '#bfdbfe';
        if (lightness > 0.6) return '#93c5fd';
        if (lightness > 0.5) return '#60a5fa';
        if (lightness > 0.4) return '#3b82f6';
        return '#1e40af';
      }
      
      // Amber/Orange hues (around 40-50)
      if (hue >= 20 && hue <= 70) {
        if (lightness > 0.8) return '#fef3c7';
        if (lightness > 0.7) return '#fde68a';
        if (lightness > 0.6) return '#fcd34d';
        if (lightness > 0.5) return '#fbbf24';
        return '#f59e0b';
      }
      
      // Green hues (around 160)
      if (hue >= 120 && hue <= 180) {
        if (lightness > 0.8) return '#dcfce7';
        if (lightness > 0.7) return '#bbf7d0';
        if (lightness > 0.6) return '#86efac';
        if (lightness > 0.5) return '#4ade80';
        return '#22c55e';
      }
      
      // Default fallback based on lightness
      if (lightness > 0.8) return '#f3f4f6';
      if (lightness > 0.6) return '#5a7fee';
      if (lightness > 0.4) return '#3053e0';
      return '#1e3a8a';
    }
    
    // Ultimate fallback
    return '#666666';
  };

  const sanitizeColors = (element) => {
    // Recursively go through all elements and fix oklch colors and remove classes
    const elements = element.querySelectorAll('*');
    elements.forEach(el => {
      // First, handle inline styles with oklch
      const styles = el.getAttribute('style') || '';
      if (styles.includes('oklch')) {
        let sanitized = styles;
        sanitized = sanitized.replace(/oklch\s*\([^)]+\)/gi, (match) => convertOklchToHex(match));
        el.setAttribute('style', sanitized);
      }
      
      // Get computed styles BEFORE removing classes
      const computedStyle = window.getComputedStyle(el);
      const colorProps = ['backgroundColor', 'color', 'borderColor', 'boxShadow', 'textShadow'];
      
      colorProps.forEach(prop => {
        try {
          const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
          if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
            const cssName = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            // Convert oklch if present
            let finalValue = value;
            if (value.includes('oklch')) {
              finalValue = value.replace(/oklch\s*\([^)]+\)/gi, (match) => convertOklchToHex(match));
            }
            el.style.setProperty(cssName, finalValue, 'important');
          }
        } catch (_err) {
          // Skip errors
        }
      });
      
      // Now remove all classes to prevent any CSS resolution issues
      el.setAttribute('class', '');
    });
  };

  const _addPageBreakStyles = (element) => {
    // Add CSS to prevent awkward page breaks
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .print-section { page-break-inside: avoid; }
      }
    `;
    element.appendChild(style);
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || isDownloading || isScriptLoading) {
      console.error("Cannot generate PDF: component ref is missing, download is in progress, or scripts are still loading.");
      return;
    }

    setIsDownloading(true);
    
    let tempContainer = null;

    try {
      // Create a temporary container
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = 'auto';
      tempContainer.style.maxWidth = '1000px';
      tempContainer.style.visibility = 'visible';
      tempContainer.style.pointerEvents = 'none';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0';
      document.body.appendChild(tempContainer);

      // Clone the element - preserve all styling
      const clonedElement = printRef.current.cloneNode(true);
      clonedElement.style.width = '100%';
      clonedElement.style.margin = '0';
      clonedElement.style.padding = '1.5rem';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.lineHeight = '1.6';

      // Sanitize oklch colors before adding to DOM
      sanitizeColors(clonedElement);

      tempContainer.appendChild(clonedElement);

      // Wait a moment for styles to be applied
      await new Promise(resolve => setTimeout(resolve, 150));

      console.log('Capturing element with html2canvas...');

      // Capture the element with better configuration
      const canvas = await window.html2canvas(clonedElement, {
        scale: 2,
        useCORS: false,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: false,
        willReadFrequently: false,
        imageTimeout: 10000,
        timeout: 30000,
        windowWidth: 900,
        windowHeight: clonedElement.scrollHeight,
        foreignObjectRendering: false,
        proxy: null,
        ignoreElements: (element) => {
          return element.tagName === 'SCRIPT' || element.tagName === 'META' || element.tagName === 'LINK' || element.tagName === 'STYLE';
        },
        onclone: (clonedDocument) => {
          console.log('onclone: Removing all stylesheets and style tags');
          // Remove ALL external stylesheets and style tags
          const links = clonedDocument.querySelectorAll('link[rel="stylesheet"]');
          links.forEach(link => link.remove());
          
          const styles = clonedDocument.querySelectorAll('style');
          styles.forEach(style => style.remove());
          
          console.log('onclone: Removed stylesheets, remaining links:', clonedDocument.querySelectorAll('link').length);
        }
      });

      console.log('Canvas created successfully');

      const imgData = canvas.toDataURL('image/png');
      console.log('Image data generated, length:', imgData.length);

      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const topMargin = 5;
      const bottomMargin = 10; // Extra bottom margin to prevent content from being cut off
      const sideMargin = 5;
      const usableWidth = pageWidth - (sideMargin * 2);
      const usableHeight = pageHeight - topMargin - bottomMargin; // Account for bottom margin
      
      // Calculate image height maintaining aspect ratio
      const imgHeight = (imgProps.height * usableWidth) / imgProps.width;

      console.log('PDF dimensions - Page:', pageWidth, 'x', pageHeight, 'Usable Height:', usableHeight, 'Image Height:', imgHeight);

      // If content fits on one page, add it simply
      if (imgHeight <= usableHeight) {
        pdf.addImage(imgData, 'PNG', sideMargin, topMargin, usableWidth, imgHeight);
      } else {
        // For multi-page PDFs, split the canvas properly
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate pixels per mm to maintain consistency
        const pixelsPerMm = canvasHeight / imgHeight;
        const pageHeightInPixels = usableHeight * pixelsPerMm;
        
        // Calculate number of pages needed
        const numPages = Math.ceil(canvasHeight / pageHeightInPixels);
        
        console.log('Total pages needed:', numPages, 'Page height in pixels:', pageHeightInPixels);
        
        // Add each page
        for (let i = 0; i < numPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const yOffset = i * pageHeightInPixels;
          const pageCanvasHeight = Math.min(pageHeightInPixels, canvasHeight - yOffset);
          
          // Create temporary canvas to crop the section
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasWidth;
          tempCanvas.height = pageCanvasHeight;
          
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(
            canvas,
            0,
            yOffset,
            canvasWidth,
            pageCanvasHeight,
            0,
            0,
            canvasWidth,
            pageCanvasHeight
          );
          
          const croppedImgData = tempCanvas.toDataURL('image/png');
          const croppedHeight = (pageCanvasHeight * usableWidth) / canvasWidth;
          
          pdf.addImage(croppedImgData, 'PNG', sideMargin, topMargin, usableWidth, croppedHeight);
        }
      }

      pdf.save(`Shipment_${shipment?.trackingNumber || 'details'}.pdf`);
      console.log('PDF saved successfully');

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      // Always clean up temporary elements
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
      setIsDownloading(false);
    }
  };

  // Helper function to get color styles based on status
  const getStatusColors = (status) => {
    switch (status) {
      case 'delivered': 
        return { backgroundColor: '#D1FAE5', color: '#065F46' }; // Green
      case 'in-transit': 
        return { backgroundColor: '#FEF9C3', color: '#854D0E' }; // Amber
      case 'cancelled': 
        return { backgroundColor: '#FECACA', color: '#991B1B' }; // Red
      case 'processing': 
        return { backgroundColor: '#DBEAFE', color: '#1E3A8A' }; // Blue
      case 'pickup-scheduled': 
        return { backgroundColor: '#FFF7ED', color: '#9A3412' }; // Orange
      case 'out-for-delivery': 
        return { backgroundColor: '#FCE7F3', color: '#9D174D' }; // Pink
      case 'picked-up': 
        return { backgroundColor: '#F3E8FF', color: '#6B21A8' }; // Purple
      case 'arrived-at-hub': 
        return { backgroundColor: '#EDE9FE', color: '#5B21B6' }; // Indigo
      case 'departed-from-hub': 
        return { backgroundColor: '#E0F2FE', color: '#0369A1' }; // Sky Blue
      case 'on-hold': 
        return { backgroundColor: '#FEF2F2', color: '#B91C1C' }; // Strong Red
      case 'customs-clearance': 
        return { backgroundColor: '#CCFBF1', color: '#0F766E' }; // Teal
      case 'Awaiting Pickup': 
        return { backgroundColor: '#FAE8FF', color: '#86198F' }; // Fuchsia
      case 'failed-delivery-attempt': 
        return { backgroundColor: '#FFE4E6', color: '#9F1239' }; // Rose
      case 'Awaiting Delivery': 
        return { backgroundColor: '#ECFCCB', color: '#3F6212' }; // Lime
      case 'Arrived Carrier Connecting facility': 
        return { backgroundColor: '#FEF9C3', color: '#713F12' }; // Yellow
      case 'Departed CARGO realm facility (Nig)': 
        return { backgroundColor: '#FFEDD5', color: '#9A3412' }; // Orange
      case 'Arrived nearest airport': 
        return { backgroundColor: '#E0F2FE', color: '#075985' }; // Sky
      case 'Shipment is Delayed': 
        return { backgroundColor: '#FFE4E6', color: '#9F1239' }; // Rose
      case 'Delivery date not available': 
        return { backgroundColor: '#F3F4F6', color: '#1F2937' }; // Neutral Gray
      case 'Available for pick up,check phone for instructions': 
        return { backgroundColor: '#DCFCE7', color: '#166534' }; // Strong Green
      case 'Processed in Lagos Nigeria': 
        return { backgroundColor: '#FDE68A', color: '#92400E' }; // Amber
      case 'Pending Carrier lift': 
        return { backgroundColor: '#E0E7FF', color: '#3730A3' }; // Indigo Blue
      case 'Scheduled to depart on the next movement': 
        return { backgroundColor: '#FBCFE8', color: '#9D174D' }; // Pink
      case 'Received from flight': 
        return { backgroundColor: '#E0F7FA', color: '#006064' }; // Cyan
      case 'Package is received and accepted by airline': 
        return { backgroundColor: '#D1FAE5', color: '#065F46' }; // Deep Green
      case 'Customs clearance completed': 
        return { backgroundColor: '#BBF7D0', color: '#15803D' }; // Bright Green
      case 'Delivery is booked': 
        return { backgroundColor: '#E0E7FF', color: '#4338CA' }; // Blue Indigo
      case 'Arrived at an international sorting facility and will be ready for delivery soon': 
        return { backgroundColor: '#C7D2FE', color: '#1E3A8A' }; // Cool Indigo
      case 'pending': 
        return { backgroundColor: '#FEF2F2', color: '#B91C1C' }; // Red Neutral
      default: 
        return { backgroundColor: '#F3F4F6', color: '#1F2937' }; // Neutral Gray
    }
  };


  return (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipment Details</h2>
          <p className="text-sm text-gray-500 mt-1">Professional shipment documentation</p>
        </div>
      </div>
      <div className="overflow-auto max-h-[70vh] my-4 rounded-lg border border-gray-200 shadow-sm">
        {/* The content below uses inline styles for full compatibility with html2canvas */}
        <div ref={printRef} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '1.5rem', height: '100%', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
          {shipment ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
                <img
                  src={tofar}
                  alt="Logo"
                  style={{ width: '150px', height: '120px', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1.5rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', gap: '1rem' }}>
                <div style={{ flex: 1, width: '100%' }}>
                  <p style={{ fontWeight: '700', fontSize: '1rem', color: '#1f2937', marginBottom: '0.4rem' }}>Tofar Logistics Agency</p>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: '1.4rem', marginBottom: '0.5rem' }}>
                    Nacho Export Warehouse<br />
                    Murital Muhammad International Airport<br />
                    Ikeja, Lagos, Nigeria
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: '600', color: '#4b5563' }}>Email:</span> info@tofarcargo.com
                  </p>
                </div>
                {shipment.qrCodeUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                    <img
                      src={shipment.qrCodeUrl}
                      alt="Shipment QR Code"
                      style={{ width: '100px', height: '100px', border: '2px solid #3053e0', borderRadius: '0.5rem', padding: '0.4rem', backgroundColor: '#ffffff' }}
                    />
                    <p style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center', fontWeight: '500' }}>Scan for tracking</p>
                  </div>
                )}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1F2937', backgroundColor: 'linear-gradient(135deg, #3053e0 0%, #2d3db0 100%)', backgroundImage: 'linear-gradient(135deg, #3053e0 0%, #2d3db0 100%)', paddingBottom: '0.75rem', paddingLeft: '0.75rem', marginBottom: '1rem', borderBottom: '3px solid #3053e0' }}>
                <span style={{ display: 'block', color: '#ffffff' }}>Shipment Details</span>
                <span style={{ display: 'block', color: '#e0e7ff', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.4rem' }}>Tracking: {shipment.trackingNumber}</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '1.5rem', rowGap: '1rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                {/* Shipment details */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Tracking Number</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.trackingNumber}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Sender Name</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.senderName}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Sender Phone</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.senderPhone}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Sender Email</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.senderEmail}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Sender Address</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.senderAddress}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Status</span>
                  <div style={{ ...getStatusColors(shipment.status), fontWeight: '600', textTransform: 'capitalize', width: 'fit-content', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {shipment.status}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Receiver Name</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.recipientName}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Receiver Phone</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.recipientPhone}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Receiver Email</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.receiverEmail}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Receiver Address</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.recipientAddress}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Origin</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.origin}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Destination</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.destination}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Pieces</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.shipmentPieces}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Type</span>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>{shipment.shipmentType}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Purpose</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.shipmentPurpose}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Description</span>
                  <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '0.9rem', lineHeight: '1.5rem' }}>{shipment.notes}</span>
                </div>

                {/* Dimensions Section */}
                <div style={{ gridColumn: 'span 2', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ display: 'inline-block', width: '3px', height: '3px', backgroundColor: '#3053e0', borderRadius: '50%', marginRight: '0.5rem' }}></span>
                    Package Dimensions & Pricing
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '1rem', rowGap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #3053e0', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Weight</span>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.weight}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #3053e0', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Length</span>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #3053e0', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Width</span>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.width}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', backgroundColor: '#eff6ff', borderLeft: '3px solid #3053e0', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Height</span>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{shipment.height}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', backgroundColor: '#f0fdf4', borderLeft: '3px solid #22c55e', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Cost</span>
                      <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '1rem' }}>₦{shipment.cost}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem', backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Date</span>
                      <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.9rem' }}>{new Date(shipment.shipmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ display: 'inline-block', width: '3px', height: '3px', backgroundColor: '#3053e0', borderRadius: '50%', marginRight: '0.5rem' }}></span>
                    Shipment Items
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#3053e0', color: '#FFFFFF', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '2px solid #2d3db0' }}>S/N</th>
                        <th style={{ padding: '0.6rem', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em', borderBottom: '2px solid #2d3db0' }}>Item Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipment.items.map((item, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '0.6rem', fontWeight: '600', color: '#3053e0', width: '50px', fontSize: '0.9rem' }}>{index + 1}</td>
                          <td style={{ padding: '0.6rem', color: '#1f2937', fontWeight: '500', fontSize: '0.85rem' }}>{item}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p>Loading shipment data...</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="px-6 py-2 font-medium hover:bg-gray-50 transition-all"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleDownloadPDF} 
          disabled={!shipment || isDownloading || isScriptLoading}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScriptLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Loading...
            </>
          ) : isDownloading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              📥 Download PDF
            </>
          )}
        </Button>
      </div>
    </>
  );
}
