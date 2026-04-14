import { useState, useRef } from "react";
import LassoCanvas from "../components/LassoCanvas";
import { encodeRLE } from "../components/rle";
import CryptoJS from "crypto-js";
import pako from "pako"; 
import { Upload, Lock, Download, Image as ImageIcon, Key, AlertCircle } from "lucide-react";
import { useToast, ToastContainer } from "../components/Toast";

// Helper for PBKDF2 Key Derivation
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Helper to convert Uint8Array to Base64 without crashing the stack
function uint8ArrayToBase64(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  const chunk = 8192; // Process in 8KB chunks
  for (let i = 0; i < len; i += chunk) {
    binary += String.fromCharCode.apply(null, uint8Array.subarray(i, Math.min(i + chunk, len)));
  }
  return btoa(binary);
}

export default function UploadPage() {
  const [imgSrc, setImgSrc] = useState(null);
  const [preview, setPreview] = useState(null);
  const [password, setPassword] = useState("");
  const binaryDataRef = useRef(null);
  const { toasts, removeToast, toast } = useToast();

  const handleImage = (e) => {
    const r = new FileReader();
    r.onload = (ev) => setImgSrc(ev.target.result);
    r.readAsDataURL(e.target.files[0]);
  };

  const handleMask = (maskCanvas) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const maskData = maskCanvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;

      const pixelsToSave = [];
      const binaryMask = [];

      const chunkLimit = 65536; 
      const tempRandomBuffer = new Uint8Array(chunkLimit);
      window.crypto.getRandomValues(tempRandomBuffer);
      let randomIndex = 0;

      for (let i = 0; i < imgData.data.length; i += 4) {
        const isMasked = maskData[i + 3] > 150; 
        binaryMask.push(isMasked ? 1 : 0);
        
        if (isMasked) {
          pixelsToSave.push(imgData.data[i], imgData.data[i+1], imgData.data[i+2]);
          
          if (randomIndex + 3 >= chunkLimit) {
            window.crypto.getRandomValues(tempRandomBuffer);
            randomIndex = 0;
          }

          imgData.data[i] = tempRandomBuffer[randomIndex++];     
          imgData.data[i+1] = tempRandomBuffer[randomIndex++]; 
          imgData.data[i+2] = tempRandomBuffer[randomIndex++]; 
          imgData.data[i+3] = 255; 
        }
      }

      const compressedMask = encodeRLE(binaryMask);
      const totalSize = 8 + (compressedMask.length * 4) + pixelsToSave.length; 
      const buffer = new ArrayBuffer(totalSize);
      const view = new DataView(buffer);
      
      view.setUint16(0, canvas.width);
      view.setUint16(2, canvas.height);
      view.setUint32(4, compressedMask.length);

      let offset = 8;
      compressedMask.forEach(val => { view.setUint32(offset, val); offset += 4; });
      new Uint8Array(buffer, offset).set(pixelsToSave);

      const rawU8 = new Uint8Array(buffer);
      binaryDataRef.current = pako.deflate(rawU8); 

      ctx.putImageData(imgData, 0, 0);
      setPreview(canvas.toDataURL("image/png"));
    };
  };

  const downloadFiles = async () => {
    if (!password || !binaryDataRef.current) {
      toast.error("Missing Information", !password ? "Please enter an encryption key before downloading." : "Please draw a mask selection on the image first.");
      return;
    }

    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        binaryDataRef.current
      );

      const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
      combined.set(salt, 0);
      combined.set(iv, 16);
      combined.set(new Uint8Array(encryptedBuffer), 28);

      // FIXED: Chunked Base64 conversion
      const base64Data = uint8ArrayToBase64(combined);

      const a = document.createElement("a");
      a.href = preview;
      a.download = "scrambled.png";
      a.click();

      const b = document.createElement("a");
      b.href = URL.createObjectURL(new Blob([base64Data], { type: "text/plain" }));
      b.download = "secure_data.bin";
      b.click();

      toast.success("Download Started", "Files secured with AES-GCM.");
    } catch (error) {
      console.error(error);
      toast.error("Encryption Failed", "An error occurred.");
    }
  };
  return (
    <div style={containerStyle}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Inter:wght@400;600&family=Fira+Code&display=swap');
          
          .crypto-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(106, 17, 203, 0.6);
          }
          
          .file-input-wrapper:hover {
            border-color: rgba(0, 242, 255, 0.6);
            box-shadow: 0 4px 20px rgba(0, 242, 255, 0.3);
          }

          @media (max-width: 768px) {
            .page-title { font-size: 2rem !important; }
            .preview-card { padding: 20px !important; }
          }
        `}
      </style>

      <div style={neonOval1}></div>
      <div style={neonOval2}></div>

      <div style={headerSection}>
        <Lock size={40} style={{color: '#00f2ff', marginRight: '15px'}} />
        <h2 style={gradientHeader} className="page-title">Scramble & Encrypt</h2>
      </div>

      <div style={instructionCard}>
        <AlertCircle size={20} style={{marginRight: '10px', color: '#00f2ff'}} />
        <p style={instructionText}>
          Upload an image, select the ROI to encrypt, then download the scrambled output + secure key file
        </p>
      </div>

      <div style={uploadSection}>
        <label htmlFor="file-upload" style={fileLabel} className="file-input-wrapper">
          <Upload size={24} style={{marginBottom: '10px'}} />
          <span style={{fontSize: '1.1rem', fontWeight: 'bold'}}>Select Image</span>
          <span style={{fontSize: '0.85rem', color: '#888', marginTop: '5px'}}>PNG, JPG, JPEG supported</span>
          <input 
            id="file-upload"
            type="file" 
            accept="image/*" 
            onChange={handleImage} 
            style={hiddenInput} 
          />
        </label>
      </div>

      {imgSrc && <LassoCanvas src={imgSrc} onComplete={handleMask} />}

      {preview && (
        <div style={previewCard} className="preview-card">
          <div style={cardHeader}>
            <ImageIcon size={24} style={{marginRight: '10px', color: '#00f2ff'}} />
            <h3 style={cardTitle}>Encrypted Preview</h3>
          </div>

          <div style={imageWrapper}>
            <img src={preview} alt="preview" style={previewImageStyle} />
          </div>

          <div style={keySection}>
            <div style={inputWrapper}>
              <Key size={20} style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#00f2ff'}} />
              <input 
                type="password" 
                placeholder="Enter Encryption Key" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={passwordInputStyle} 
              />
            </div>
          </div>

          <button onClick={downloadFiles} style={actionButtonStyle} className="crypto-btn">
            <Download size={20} style={{marginRight: '10px'}} />
            Download Encrypted Files
          </button>

          <div style={warningBox}>
            <AlertCircle size={18} style={{marginRight: '8px'}} />
            <span>Save both files and your key securely. Loss of key = permanent data loss.</span>
          </div>
        </div>
      )}
    </div>
  );
}

const containerStyle = { 
  minHeight: "100vh",
  background: "#050508",
  color: "#fff",
  padding: "40px 20px",
  position: "relative",
  overflow: "hidden"
};

const neonOval1 = {
  position: "fixed",
  top: "-100px",
  right: "-100px",
  width: "400px",
  height: "400px",
  background: "radial-gradient(circle, rgba(106, 17, 203, 0.2) 0%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(80px)",
  zIndex: 0,
  pointerEvents: "none"
};

const neonOval2 = {
  position: "fixed",
  bottom: "-150px",
  left: "-150px",
  width: "500px",
  height: "500px",
  background: "radial-gradient(circle, rgba(37, 117, 252, 0.15) 0%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(100px)",
  zIndex: 0,
  pointerEvents: "none"
};

const headerSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "30px",
  position: "relative",
  zIndex: 1
};

const gradientHeader = { 
  fontSize: "2.5rem",
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: "900",
  background: "linear-gradient(135deg, #00f2ff 0%, #2575fc 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  letterSpacing: "2px",
  textShadow: "0 0 30px rgba(0, 242, 255, 0.3)"
};

const instructionCard = {
  background: "rgba(0, 242, 255, 0.05)",
  border: "1px solid rgba(0, 242, 255, 0.3)",
  borderRadius: "12px",
  padding: "15px 25px",
  margin: "0 auto 30px",
  maxWidth: "700px",
  display: "flex",
  alignItems: "center",
  position: "relative",
  zIndex: 1
};

const instructionText = {
  margin: 0,
  fontSize: "0.95rem",
  color: "#ccc",
  lineHeight: "1.5"
};

const uploadSection = {
  display: "flex",
  justifyContent: "center",
  margin: "40px 0",
  position: "relative",
  zIndex: 1
};

const fileLabel = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 60px",
  background: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(10px)",
  border: "2px dashed rgba(0, 242, 255, 0.4)",
  borderRadius: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  color: "#00f2ff",
  fontFamily: "'Inter', sans-serif"
};

const hiddenInput = {
  display: "none"
};

const previewCard = {
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(0, 242, 255, 0.2)",
  borderRadius: "20px",
  padding: "40px",
  margin: "40px auto",
  maxWidth: "900px",
  position: "relative",
  zIndex: 1,
  boxShadow: "0 8px 32px rgba(0, 242, 255, 0.15)"
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "30px"
};

const cardTitle = {
  fontSize: "1.8rem",
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: "700",
  color: "#fff",
  margin: 0
};

const imageWrapper = {
  marginBottom: "30px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid rgba(0, 242, 255, 0.3)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
};

const previewImageStyle = { 
  width: "100%",
  maxHeight: "500px",
  height: "auto",
  display: "block",
  objectFit: "contain",
  background: "#000"
};

const keySection = {
  marginBottom: "25px"
};

const inputWrapper = {
  position: "relative",
  maxWidth: "400px",
  margin: "0 auto"
};

const passwordInputStyle = { 
  width: "100%",
  padding: "15px 15px 15px 50px",
  borderRadius: "10px",
  border: "1px solid rgba(0, 242, 255, 0.3)",
  background: "rgba(0, 0, 0, 0.5)",
  color: "#fff",
  fontSize: "1rem",
  fontFamily: "'Fira Code', monospace",
  boxSizing: "border-box",
  transition: "all 0.3s ease"
};

const actionButtonStyle = { 
  padding: "16px 40px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "1.05rem",
  fontWeight: "700",
  fontFamily: "'Orbitron', sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px rgba(106, 17, 203, 0.4)"
};

const warningBox = {
  background: "rgba(255, 165, 0, 0.1)",
  border: "1px solid rgba(255, 165, 0, 0.3)",
  padding: "12px 20px",
  borderRadius: "8px",
  marginTop: "25px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  color: "#ffaa00",
  fontFamily: "'Fira Code', monospace"
};