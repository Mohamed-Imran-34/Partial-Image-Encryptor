import { useState } from "react";
import { decodeRLE } from "../components/rle";
import pako from "pako";
import { Unlock, FileImage, FileKey, Key, Download, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useToast, ToastContainer } from "../components/Toast";

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

export default function DecryptPage() {
  const [imgFile, setImgFile] = useState(null);
  const [binFile, setBinFile] = useState(null);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();

  const restore = () => {
    if (!imgFile || !binFile || !password) {
      toast.error("Missing Fields", "Please provide all files and the key.");
      return;
    }
    setLoading(true);

    const ir = new FileReader();
    const br = new FileReader();

    ir.onload = (e) => {
      br.onload = async (b) => {
  try {
    // 1. Process Base64 from the .bin file
    const base64Content = b.target.result;
    const binaryString = atob(base64Content);
    const len = binaryString.length;
    const combined = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    // 2. Extract Crypto Components
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);

    // 3. Decrypt the payload
    const key = await deriveKey(password, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    const decryptedU8 = new Uint8Array(decryptedBuffer);

    // ─── THE CRITICAL FIX ───
    // Split the Hash from the Compressed Data BEFORE inflating.
    // Pako cannot "see" the 32-byte hash or it throws "incorrect header check".
    const storedHash = decryptedU8.slice(0, 32);
    const compressedPayload = decryptedU8.slice(32);

    // Now inflate ONLY the pixel data payload
    const fullU8 = pako.inflate(compressedPayload);
    // ────────────────────────

    // 4. IMAGE AUTHENTICITY CHECK
    const scrambledArrayBuffer = await imgFile.arrayBuffer();
    const recomputedHashBuffer = await window.crypto.subtle.digest(
      "SHA-256",
      scrambledArrayBuffer
    );
    const recomputedHash = new Uint8Array(recomputedHashBuffer);

    const hashMatch =
      storedHash.length === recomputedHash.length &&
      storedHash.every((byte, idx) => byte === recomputedHash[idx]);

    if (!hashMatch) {
      setLoading(false);
      toast.error(
        "Image Mismatch",
        "This .bin file does not belong to this image or the image was modified."
      );
      return;
    }

    // 5. PARSE PIXEL DATA
    // fullU8 is now purely the uncompressed pixel buffer [width, height, maskLen, etc.]
    const view = new DataView(fullU8.buffer, fullU8.byteOffset, fullU8.byteLength);
    const width = view.getUint16(0);
    const height = view.getUint16(2);
    const maskLen = view.getUint32(4);

    let offset = 8;
    const compressedMask = [];
    for (let i = 0; i < maskLen; i++) {
      compressedMask.push(view.getUint32(offset));
      offset += 4;
    }
    const pixels = fullU8.slice(offset);
    const mask = decodeRLE(compressedMask, width * height);

    // 6. DRAW TO CANVAS
    const img = new Image();
    img.src = e.target.result; // The DataURL from imgFile
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);

      let pIdx = 0;
      for (let i = 0; i < mask.length; i++) {
        if (mask[i] === 1) {
          const p = i * 4;
          imageData.data[p] = pixels[pIdx];
          imageData.data[p + 1] = pixels[pIdx + 1];
          imageData.data[p + 2] = pixels[pIdx + 2];
          imageData.data[p + 3] = 255;
          pIdx += 3;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
      toast.success("Decryption Successful", "Image restored.");
    };
  } catch (err) {
    setLoading(false);
    toast.error("Decryption Failed", "Incorrect key or corrupted data.");
    console.error("Decryption Error:", err);
  }
};
      br.readAsText(binFile);
    };
    ir.readAsDataURL(imgFile);
  };

  return (
    <div style={containerStyle}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Inter:wght@400;600&family=Fira+Code&display=swap');
          
          .crypto-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(106, 17, 203, 0.6);
          }
          
          .file-upload-btn:hover {
            border-color: rgba(0, 242, 255, 0.6);
            background: rgba(0, 242, 255, 0.05);
          }

          @media (max-width: 768px) {
            .page-title { font-size: 2rem !important; }
            .upload-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      <div style={neonOval1}></div>
      <div style={neonOval2}></div>

      <div style={headerSection}>
        <Unlock size={40} style={{color: '#00f2ff', marginRight: '15px'}} />
        <h2 style={gradientHeader} className="page-title">Restore & Decrypt</h2>
      </div>

      <div style={instructionCard}>
        <AlertCircle size={20} style={{marginRight: '10px', color: '#00f2ff'}} />
        <p style={instructionText}>
          Upload the scrambled image and secure data file, then enter your decryption key to restore the original
        </p>
      </div>

      <div style={uploadCard}>
        <div style={uploadGrid} className="upload-grid">
          <div style={inputGroup}>
            <label style={labelStyle}>
              <FileImage size={20} style={{marginRight: '8px'}} />
              1. Scrambled Image
            </label>
            <label htmlFor="img-upload" style={fileUploadBtn} className="file-upload-btn">
              {imgFile ? (
                <>
                  <CheckCircle size={20} style={{marginRight: '8px', color: '#00ff88'}} />
                  <span>{imgFile.name}</span>
                </>
              ) : (
                <>
                  <FileImage size={20} style={{marginRight: '8px'}} />
                  <span>Choose Image File</span>
                </>
              )}
              <input 
                id="img-upload"
                type="file" 
                accept="image/*" 
                onChange={e => setImgFile(e.target.files[0])} 
                style={hiddenInput} 
              />
            </label>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>
              <FileKey size={20} style={{marginRight: '8px'}} />
              2. Secure Data (.bin)
            </label>
            <label htmlFor="bin-upload" style={fileUploadBtn} className="file-upload-btn">
              {binFile ? (
                <>
                  <CheckCircle size={20} style={{marginRight: '8px', color: '#00ff88'}} />
                  <span>{binFile.name}</span>
                </>
              ) : (
                <>
                  <FileKey size={20} style={{marginRight: '8px'}} />
                  <span>Choose .bin File</span>
                </>
              )}
              <input 
                id="bin-upload"
                type="file" 
                accept=".bin" 
                onChange={e => setBinFile(e.target.files[0])} 
                style={hiddenInput} 
              />
            </label>
          </div>
        </div>

        <div style={keySection}>
          <label style={labelStyle}>
            <Key size={20} style={{marginRight: '8px'}} />
            3. Decryption Key
          </label>
          <div style={inputWrapper}>
            <Key size={20} style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#00f2ff'}} />
            <input 
              type="password" 
              placeholder="Enter Your Secret Key" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={passwordInputStyle} 
            />
          </div>
        </div>

        <button 
          onClick={restore} 
          disabled={loading || !imgFile || !binFile || !password} 
          style={loading || !imgFile || !binFile || !password ? disabledButtonStyle : actionButtonStyle}
          className="crypto-btn"
        >
          {loading ? (
            <>
              <Loader size={20} style={{marginRight: '10px', animation: 'spin 1s linear infinite'}} />
              Decrypting...
            </>
          ) : (
            <>
              <Unlock size={20} style={{marginRight: '10px'}} />
              Restore Original Image
            </>
          )}
        </button>
      </div>

      {result && (
        <div style={resultCard}>
          <div style={cardHeader}>
            <CheckCircle size={28} style={{marginRight: '12px', color: '#00ff88'}} />
            <h3 style={cardTitle}>Restoration Successful</h3>
          </div>

          <div style={imageWrapper}>
            <img src={result} alt="restored" style={previewImageStyle} />
          </div>

          <a href={result} download="restored_original.png" style={{textDecoration: 'none'}}>
            <button style={downloadButtonStyle} className="crypto-btn">
              <Download size={20} style={{marginRight: '10px'}} />
              Download Restored Image
            </button>
          </a>

          <div style={successBox}>
            <CheckCircle size={18} style={{marginRight: '8px'}} />
            <span>Image restored with zero data loss. Original quality maintained.</span>
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
  left: "-100px",
  width: "450px",
  height: "450px",
  background: "radial-gradient(circle, rgba(106, 17, 203, 0.2) 0%, transparent 70%)",
  borderRadius: "50%",
  filter: "blur(80px)",
  zIndex: 0,
  pointerEvents: "none"
};

const neonOval2 = {
  position: "fixed",
  bottom: "-120px",
  right: "-120px",
  width: "500px",
  height: "500px",
  background: "radial-gradient(circle, rgba(37, 117, 252, 0.18) 0%, transparent 70%)",
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
  letterSpacing: "2px"
};

const instructionCard = {
  background: "rgba(0, 242, 255, 0.05)",
  border: "1px solid rgba(0, 242, 255, 0.3)",
  borderRadius: "12px",
  padding: "15px 25px",
  margin: "0 auto 40px",
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

const uploadCard = {
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(0, 242, 255, 0.2)",
  borderRadius: "20px",
  padding: "40px",
  margin: "0 auto",
  maxWidth: "800px",
  position: "relative",
  zIndex: 1,
  boxShadow: "0 8px 32px rgba(0, 242, 255, 0.15)"
};

const uploadGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "25px",
  marginBottom: "30px"
};

const inputGroup = { 
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const labelStyle = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "#00f2ff",
  fontFamily: "'Orbitron', sans-serif",
  display: "flex",
  alignItems: "center",
  letterSpacing: "0.5px"
};

const fileUploadBtn = {
  padding: "20px",
  border: "2px dashed rgba(0, 242, 255, 0.3)",
  borderRadius: "12px",
  background: "rgba(0, 0, 0, 0.3)",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.95rem",
  fontWeight: "600"
};

const hiddenInput = {
  display: "none"
};

const keySection = {
  marginBottom: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const inputWrapper = {
  position: "relative"
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
  boxSizing: "border-box"
};

const actionButtonStyle = { 
  width: "100%",
  padding: "18px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "1.1rem",
  fontWeight: "700",
  fontFamily: "'Orbitron', sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px rgba(106, 17, 203, 0.4)"
};

const disabledButtonStyle = {
  ...actionButtonStyle,
  background: "rgba(100, 100, 100, 0.3)",
  cursor: "not-allowed",
  boxShadow: "none"
};

const resultCard = {
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(0, 255, 136, 0.3)",
  borderRadius: "20px",
  padding: "40px",
  margin: "40px auto 0",
  maxWidth: "900px",
  position: "relative",
  zIndex: 1,
  boxShadow: "0 8px 32px rgba(0, 255, 136, 0.15)"
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
  border: "1px solid rgba(0, 255, 136, 0.3)",
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

const downloadButtonStyle = {
  ...actionButtonStyle,
  background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
  boxShadow: "0 4px 20px rgba(0, 255, 136, 0.4)"
};

const successBox = {
  background: "rgba(0, 255, 136, 0.1)",
  border: "1px solid rgba(0, 255, 136, 0.3)",
  padding: "12px 20px",
  borderRadius: "8px",
  marginTop: "25px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.85rem",
  color: "#00ff88",
  fontFamily: "'Fira Code', monospace"
};
