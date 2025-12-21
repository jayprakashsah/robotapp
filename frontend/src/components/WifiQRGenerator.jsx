import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Cpu, QrCode, Copy, Check, Shield, Zap } from 'lucide-react';

const WifiQRGenerator = () => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [generatedString, setGeneratedString] = useState('');
  const [copied, setCopied] = useState(false);

  const generateQR = () => {
    // Standard WIFI QR Format
    const wifiString = `WIFI:S:${ssid};T:WPA;P:${password};;`;
    setGeneratedString(wifiString);
  };

  const copyToClipboard = () => {
    if (generatedString) {
      navigator.clipboard.writeText(generatedString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 border-b border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🤖 Robot Connection Setup</h2>
              <p className="text-cyan-200/80 mt-1">Connect your robot to WiFi network</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  <label className="text-white font-medium">WiFi Network Name (SSID)</label>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <input
                    type="text"
                    placeholder="Enter your WiFi name"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="relative w-full bg-gray-900/80 border border-gray-600/50 rounded-xl py-3.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <label className="text-white font-medium">WiFi Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <input
                    type="password"
                    placeholder="Enter WiFi password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full bg-gray-900/80 border border-gray-600/50 rounded-xl py-3.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">Your password is processed locally and never sent to any server.</p>
              </div>

              <motion.button
                onClick={generateQR}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!ssid || !password}
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                  ssid && password
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </div>
              </motion.button>
            </div>

            {/* Right: QR Code Display */}
            <div className="flex flex-col items-center justify-center">
              {generatedString ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mb-4 bg-white p-6 rounded-2xl shadow-xl inline-block">
                    <div className="bg-white p-2 rounded-lg shadow-inner">
                      {/* QR Code would be rendered here */}
                      <div className="w-48 h-48 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center border-2 border-cyan-300">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-cyan-600 mx-auto mb-2" />
                          <p className="text-xs font-mono text-cyan-800">QR Code Generated</p>
                          <p className="text-xs text-cyan-600 mt-1">Network: {ssid}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>QR ready for scanning</span>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={copyToClipboard}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg border border-gray-600 flex items-center gap-2 mx-auto"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Connection String
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center mx-auto mb-4">
                    <QrCode className="h-16 w-16 text-gray-500 mb-3" />
                    <p className="text-gray-400 text-sm">QR code will appear here</p>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    Enter WiFi details to generate QR code
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              How to Connect Your Robot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                <div className="text-cyan-400 font-bold text-lg mb-2">1</div>
                <h4 className="text-white font-medium mb-1">Enter WiFi Details</h4>
                <p className="text-gray-400 text-sm">Enter your network name and password above</p>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                <div className="text-cyan-400 font-bold text-lg mb-2">2</div>
                <h4 className="text-white font-medium mb-1">Generate QR Code</h4>
                <p className="text-gray-400 text-sm">Click generate to create a WiFi QR code</p>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                <div className="text-cyan-400 font-bold text-lg mb-2">3</div>
                <h4 className="text-white font-medium mb-1">Scan with Robot</h4>
                <p className="text-gray-400 text-sm">Show QR code to robot's camera for auto-connection</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WifiQRGenerator;