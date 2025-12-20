import React, { useState } from 'react';
import QRCode from 'react-qr-code'; // Run: npm install react-qr-code

const WifiQRGenerator = () => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [generatedString, setGeneratedString] = useState('');

  const generateQR = () => {
    // Standard WIFI QR Format
    const wifiString = `WIFI:S:${ssid};T:WPA;P:${password};;`;
    setGeneratedString(wifiString);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '10px', maxWidth: '400px' }}>
      <h2>🤖 Connect Robot to Wi-Fi</h2>
      <p>Enter your Wi-Fi details and show the code to the robot's face.</p>
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Wi-Fi Name (SSID)" 
          value={ssid} 
          onChange={(e) => setSsid(e.target.value)}
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', width: '100%' }}
        />
      </div>

      <button 
        onClick={generateQR}
        style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Generate QR Code
      </button>

      {generatedString && (
        <div style={{ marginTop: '20px', background: 'white', padding: '10px', display: 'inline-block' }}>
          <QRCode value={generatedString} size={200} />
        </div>
      )}
    </div>
  );
};

export default WifiQRGenerator;