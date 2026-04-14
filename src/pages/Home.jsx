import { Link } from "react-router-dom";
import { Shield, Lock, Unlock, Zap, Eye, EyeOff, Database, Key, CheckCircle, AlertTriangle, Stethoscope, FileText, ShieldCheck, UserX, HardDrive } from "lucide-react";

export default function Home() {
  return (
    <div style={containerStyle}>
      {/* --- IMPORT FONTS & ANIMATIONS --- */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&family=Fira+Code:wght@400;500&display=swap');
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.15; }
            50% { transform: scale(1.15); opacity: 0.25; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }

          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(106, 17, 203, 0.4), 0 0 40px rgba(37, 117, 252, 0.2); }
            50% { box-shadow: 0 0 30px rgba(106, 17, 203, 0.6), 0 0 60px rgba(37, 117, 252, 0.4); }
          }

          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(106, 17, 203, 0.3);
            border-color: rgba(0, 242, 255, 0.4);
          }

          .btn-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(106, 17, 203, 0.5);
          }

          .use-case-hover:hover {
            transform: translateY(-5px);
            border-color: rgba(0, 242, 255, 0.4);
            box-shadow: 0 8px 30px rgba(0, 242, 255, 0.2);
          }

          /* ── Action buttons: responsive ── */
          .action-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 40px;
            flex-wrap: wrap;
            padding: 0 16px;
            box-sizing: border-box;
            width: 100%;
          }
          .action-btn-link {
            text-decoration: none;
            flex: 1 1 220px;
            max-width: 280px;
            min-width: 0;
            box-sizing: border-box;
          }
          .action-btn-link button {
            width: 100%;
            box-sizing: border-box;
          }
          @media (max-width: 540px) {
            .action-btn-link {
              flex: 1 1 100%;
              max-width: 100%;
            }
            .action-buttons {
              gap: 14px;
              padding: 0 12px;
            }
          }

          @media (max-width: 768px) {
            .hero-title { font-size: 2.5rem !important; }
            .hero-subtitle { font-size: 0.95rem !important; }
            .grid-container { grid-template-columns: 1fr !important; }
          }

          @media (max-width: 480px) {
            .hero-title { font-size: 2rem !important; }
            .section-heading { font-size: 1.4rem !important; }
          }
        `}
      </style>

      {/* --- NEON BACKGROUND ELEMENTS --- */}
      <div style={neonOval1}></div>
      <div style={neonOval2}></div>
      <div style={neonOval3}></div>
      <div style={neonOval4}></div>

      {/* --- HERO SECTION --- */}
      <section style={heroSection}>
        <div style={statusBadge}>
          <Zap size={14} style={{marginRight: '6px'}} />
          ENCRYPTION ENGINE: ONLINE
        </div>
        
        <h1 style={titleStyle} className="hero-title">
          <Shield size={60} style={{display: 'inline-block', marginRight: '15px', verticalAlign: 'middle', color: '#00f2ff'}} />
          VAULTPIXEL <span style={{color: '#00f2ff'}}>SRPF</span>
        </h1>

        {/* ── CHANGE 1: Hero subtitle text updated ── */}
        <p style={subtitleStyle} className="hero-subtitle">
          <strong>Selective ROI-Based Reversible Protection Framework</strong> — Selective ROI sanitization with authenticated cryptographic restoration.
          <br />
          <span style={{color: '#888', fontSize: '0.9rem'}}>AES-256-GCM encryption • Lossless reconstruction under verified decryption</span>
        </p>
        
        <div className="action-buttons">
          <Link to="/upload" className="action-btn-link">
            <button style={primaryBtn} className="btn-hover">
              <Lock size={18} style={{marginRight: '10px'}} />
              ENCRYPT ASSET
            </button>
          </Link>
          <Link to="/decrypt" className="action-btn-link">
            <button style={secondaryBtn} className="btn-hover">
              <Unlock size={18} style={{marginRight: '10px'}} />
              RESTORE DATA
            </button>
          </Link>
        </div>

        {/* --- FEATURE BADGES --- */}
        <div style={featureBadges}>
          <div style={badge}><CheckCircle size={16} /> AES-GCM</div>
          <div style={badge}><CheckCircle size={16} /> CSPRNG</div>
          <div style={badge}><CheckCircle size={16} /> RLE Compression</div>
          <div style={badge}><CheckCircle size={16} /> Lossless</div>
        </div>
      </section>

      {/* --- PROTOCOL BREAKDOWN --- */}
      <section style={techSection}>
        <h2 style={sectionHeading} className="section-heading">
          <Database size={28} style={{marginRight: '12px', verticalAlign: 'middle', color: '#00f2ff'}} />
          System Architecture
        </h2>
        
        <div style={grid} className="grid-container">

          {/* ── CHANGE 2: Selective Extraction card body updated ── */}
          <div style={glassCard} className="card-hover">
            <div style={iconContainer}>
              <Eye size={40} color="#00f2ff" />
            </div>
            <div style={cardNumber}>01</div>
            <h3 style={cardTitle}>Selective Extraction</h3>
            <p style={cardText}>
              Isolation of <strong style={{color: '#00f2ff'}}>Region of Interest (ROI)</strong>. Pixel buffers corresponding to the selected ROI are programmatically extracted and stored temporarily in browser memory for cryptographic processing.
            </p>
            <div style={techTag}>LASSO • BRUSH • GEOMETRIC</div>
          </div>

          {/* ── CHANGE 9: IV sentence added at end of AES card ── */}
          <div style={glassCard} className="card-hover">
            <div style={iconContainer}>
              <Key size={40} color="#ff758c" />
            </div>
            <div style={cardNumber}>02</div>
            <h3 style={cardTitle}>AES-GCM Payload</h3>
            <p style={cardText}>
              Payload is compacted via <strong style={{color: '#ff758c'}}>RLE compression</strong> and encrypted using AES-256 in Galois/Counter Mode (GCM), an authenticated encryption scheme providing confidentiality and integrity. Each encryption operation uses a unique initialization vector (IV) as required by AES-GCM to preserve security guarantees.
            </p>
            <div style={{...techTag, background: 'rgba(255, 117, 140, 0.1)', border: '1px solid rgba(255, 117, 140, 0.3)'}}>
              CRYPTOJS • PAKO • DEFLATE
            </div>
          </div>

          {/* ── CHANGE 3: CSPRNG card ending updated ── */}
          <div style={glassCard} className="card-hover">
            <div style={iconContainer}>
              <EyeOff size={40} color="#a855f7" />
            </div>
            <div style={cardNumber}>03</div>
            <h3 style={cardTitle}>CSPRNG Injection</h3>
            <p style={cardText}>
              The visible canvas is overwritten with <strong style={{color: '#a855f7'}}>High-Entropy Noise</strong>, eliminating original pixel information in the sanitized region and preventing deterministic recovery without the cryptographic key.
            </p>
            <div style={{...techTag, background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)'}}>
              CRYPTO.GETRANDOMVALUES
            </div>
          </div>
        </div>
      </section>

      {/* ── CHANGE 8: Threat Model section inserted before Security Guarantees ── */}
      <section style={threatSection}>
        <div style={threatGlass}>
          <h2 style={{color: '#00f2ff', marginBottom: '20px', fontFamily: 'Orbitron', fontSize: '1.4rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Shield size={22} style={{marginRight: '10px'}} />
            Threat Model Assumptions
          </h2>
          <p style={{fontSize: '0.95rem', color: '#aaa', lineHeight: '1.8', margin: 0}}>
            The framework assumes secure key management, unique IV generation per encryption session, and a trusted browser runtime. The system protects against unauthorized recovery of original ROI data but does not prevent AI-generated hallucinated reconstructions that do not represent the original content.
          </p>
        </div>
      </section>

      {/* --- SECURITY GUARANTEES --- */}
      <section style={guaranteeSection}>
        <h2 style={sectionHeading} className="section-heading">
          <Shield size={28} style={{marginRight: '12px', verticalAlign: 'middle', color: '#00f2ff'}} />
          Security Guarantees
        </h2>
        
        <div style={guaranteeGrid}>
          {/* ── CHANGE 4A: Bit-Perfect text updated ── */}
          <div style={guaranteeCard}>
            <CheckCircle size={24} color="#00ff88" />
            <h4 style={guaranteeTitle}>Bit-Perfect Restoration</h4>
            <p style={guaranteeText}>Exact pixel-level reconstruction upon successful authenticated decryption.</p>
          </div>
          {/* ── CHANGE 4B: Cryptographic Privacy text updated ── */}
          <div style={guaranteeCard}>
            <CheckCircle size={24} color="#00ff88" />
            <h4 style={guaranteeTitle}>Cryptographic Privacy</h4>
            <p style={guaranteeText}>AES-256-GCM provides authenticated encryption, ensuring confidentiality and integrity of the protected ROI payload.</p>
          </div>
          {/* ── CHANGE 4C: Efficient Compression text updated ── */}
          <div style={guaranteeCard}>
            <CheckCircle size={24} color="#00ff88" />
            <h4 style={guaranteeTitle}>Efficient Compression</h4>
            <p style={guaranteeText}>RLE followed by DEFLATE compression reduces payload size for structured ROI data.</p>
          </div>
          <div style={guaranteeCard}>
            <HardDrive size={24} color="#00ff88" />
            <h4 style={guaranteeTitle}>Client-Side Processing</h4>
            <p style={guaranteeText}>Images never leave your device. All encryption happens locally in-browser.</p>
          </div>
          {/* ── CHANGE 10: Performance note card added ── */}
          <div style={guaranteeCard}>
            <CheckCircle size={24} color="#00ff88" />
            <h4 style={guaranteeTitle}>Validated Reconstruction</h4>
            <p style={guaranteeText}>Experimental validation demonstrates consistent pixel-level reconstruction accuracy under controlled encoding and decoding conditions.</p>
          </div>
        </div>
      </section>

      {/* --- THE ENTROPY PROOF --- */}
      <section style={mathSection}>
        <div style={mathGlass}>
          <h2 style={{color: '#00f2ff', marginBottom: '25px', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
            <AlertTriangle size={28} style={{marginRight: '12px'}} />
            The Entropy Framework
          </h2>
          
          <p style={{fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '25px'}}>
            Unlike traditional blurring or pixelation, VaultPixel employs <strong>CSPRNG-driven noise injection</strong> to maximize uncertainty in the sanitized region. High-entropy random values generated via the <strong>Web Crypto API</strong> approximate a uniform distribution, significantly increasing the Shannon entropy:
          </p>
          
          <div style={formulaBox}>
            <div style={{fontSize: '1.4rem', marginBottom: '15px', color: '#00ffcc'}}>
              H(X) = -Σ P(x<sub>i</sub>) log<sub>2</sub> P(x<sub>i</sub>)
            </div>
            <div style={{fontSize: '0.95rem', color: '#aaa', borderTop: '1px solid #333', paddingTop: '15px', marginTop: '15px'}}>
              Where H(X) approaches maximum entropy when P(x<sub>i</sub>) follows a uniform distribution
            </div>
          </div>

          {/* ── CHANGE 5A: "exact reconstruction infeasible" phrase replaced ── */}
          <p style={{fontSize: '0.95rem', color: '#888', marginTop: '20px', lineHeight: '1.6'}}>
            When the injected noise approaches uniformity, the observable pixel patterns reveal negligible structural information. This minimizes statistical leakage and <span style={{color: '#00f2ff'}}>removes observable structural patterns from the sanitized region, preventing recovery of the original pixel data without decryption.</span>
          </p>

          {/* ── CHANGE 5B: Warning box text updated ── */}
          <div style={warningBox}>
            <AlertTriangle size={18} style={{marginRight: '8px'}} />
            <span>Recovery of the original protected content without the correct decryption key remains computationally infeasible under standard cryptographic assumptions governing AES-256-GCM.</span>
          </div>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section style={useCaseSection}>
        <h2 style={sectionHeading} className="section-heading">Real-World Applications</h2>
        
        <div style={useCaseGrid}>
          
          <div style={useCaseCard} className="use-case-hover">
            <div style={useCaseIconContainer}>
              <FileText size={48} color="#a855f7" />
            </div>
            <h4 style={useCaseTitle}>Legal Documents</h4>
            <p style={useCaseText}>Redact sensitive information in contracts and filings while maintaining original integrity</p>
          </div>

          {/* ── CHANGE 6: Defense & Intelligence card text toned down ── */}
          <div style={useCaseCard} className="use-case-hover">
            <div style={useCaseIconContainer}>
              <ShieldCheck size={48} color="#ff758c" />
            </div>
            <h4 style={useCaseTitle}>Defense & Intelligence</h4>
            <p style={useCaseText}>Secure handling of sensitive imagery using client-side authenticated encryption.</p>
          </div>

          <div style={useCaseCard} className="use-case-hover">
            <div style={useCaseIconContainer}>
              <UserX size={48} color="#00ff88" />
            </div>
            <h4 style={useCaseTitle}>Privacy Protection</h4>
            <p style={useCaseText}>Anonymize faces, license plates, and PII in photographs before public sharing</p>
          </div>
        </div>
      </section>

      {/* ── CHANGE 7: Footer text updated ── */}
      <footer style={footer}>
        <div style={{marginBottom: '10px', fontSize: '0.85rem', color: '#555'}}>
          <Lock size={16} style={{verticalAlign: 'middle', marginRight: '6px'}} />
          VAULTPIXEL SRPF | ROI-Based Cryptographic Protection Framework | 2026
        </div>
        <div style={{fontSize: '0.7rem', color: '#444'}}>
          Built with React • CryptoJS • AES-GCM • Web Crypto API
        </div>
      </footer>
    </div>
  );
}

// --- STYLES --- (unchanged)

const containerStyle = {
  backgroundColor: "#050508",
  color: "#fff",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  position: "relative",
  overflowX: "hidden",
  padding: "40px 20px"
};

const neonOval1 = {
  position: "absolute", top: "-150px", left: "-150px", width: "600px", height: "600px",
  background: "radial-gradient(circle, rgba(106, 17, 203, 0.25) 0%, transparent 70%)",
  borderRadius: "50%", filter: "blur(100px)", animation: "pulse 8s infinite", zIndex: 0
};

const neonOval2 = {
  position: "absolute", bottom: "5%", right: "-100px", width: "500px", height: "500px",
  background: "radial-gradient(circle, rgba(37, 117, 252, 0.25) 0%, transparent 70%)",
  borderRadius: "50%", filter: "blur(100px)", animation: "pulse 6s infinite", zIndex: 0
};

const neonOval3 = {
  position: "absolute", top: "30%", left: "70%", width: "300px", height: "300px",
  background: "rgba(0, 242, 255, 0.15)", borderRadius: "50%", filter: "blur(80px)", 
  animation: "float 10s ease-in-out infinite", zIndex: 0
};

const neonOval4 = {
  position: "absolute", top: "60%", left: "10%", width: "200px", height: "200px",
  background: "rgba(255, 117, 140, 0.12)", borderRadius: "50%", filter: "blur(60px)", 
  animation: "float 12s ease-in-out infinite", zIndex: 0
};

const heroSection = {
  position: "relative", zIndex: 1, textAlign: "center", padding: "100px 20px 80px",
  animation: "slideInUp 0.8s ease-out"
};

const titleStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "4.5rem", fontWeight: "900", letterSpacing: "6px", margin: "20px 0",
  textShadow: "0 0 40px rgba(0, 242, 255, 0.5), 0 0 80px rgba(106, 17, 203, 0.3)",
  lineHeight: "1.2"
};

const statusBadge = {
  fontFamily: "'Fira Code', monospace", color: "#00ffcc", fontSize: "0.75rem",
  background: "rgba(0, 255, 204, 0.1)", padding: "8px 20px", borderRadius: "50px",
  display: "inline-flex", alignItems: "center", border: "1px solid #00ffcc", 
  marginBottom: "30px", boxShadow: "0 0 20px rgba(0, 255, 204, 0.2)"
};

const subtitleStyle = {
  color: "#aaa", fontSize: "1.1rem", maxWidth: "800px", margin: "0 auto 50px", 
  lineHeight: "1.8", padding: "0 20px"
};

const primaryBtn = {
  background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  color: "white", padding: "18px 24px", borderRadius: "8px", border: "none",
  fontFamily: "'Orbitron', sans-serif", fontWeight: "bold", fontSize: "0.95rem",
  cursor: "pointer", boxShadow: "0 0 30px rgba(106, 17, 203, 0.5)", 
  transition: "all 0.3s ease", display: "flex", alignItems: "center", 
  justifyContent: "center",
};

const secondaryBtn = {
  ...primaryBtn, 
  background: "transparent", 
  border: "2px solid #6a11cb",
  boxShadow: "0 0 20px rgba(106, 17, 203, 0.3)"
};

const featureBadges = {
  display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap"
};

const badge = {
  background: "rgba(0, 242, 255, 0.05)", border: "1px solid rgba(0, 242, 255, 0.3)",
  padding: "8px 16px", borderRadius: "20px", fontSize: "0.75rem", fontFamily: "'Fira Code', monospace",
  display: "flex", alignItems: "center", gap: "6px", color: "#00f2ff"
};

const techSection = { position: "relative", zIndex: 1, padding: "80px 5%", maxWidth: "1400px", margin: "0 auto" };

const sectionHeading = {
  textAlign: "center", fontFamily: "'Orbitron', sans-serif", fontSize: "2.2rem", 
  marginBottom: "60px", letterSpacing: "3px", display: "flex", alignItems: "center", 
  justifyContent: "center", flexWrap: "wrap"
};

const grid = { 
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
  gap: "30px", marginBottom: "40px"
};

const glassCard = {
  background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)", padding: "40px 30px", borderRadius: "16px",
  transition: "all 0.4s ease", position: "relative", overflow: "hidden"
};

const iconContainer = {
  marginBottom: "20px", display: "flex", justifyContent: "center"
};

const cardNumber = {
  fontSize: "4rem", fontWeight: "900", color: "rgba(255, 255, 255, 0.03)",
  position: "absolute", top: "10px", right: "20px", fontFamily: "'Orbitron', sans-serif",
  pointerEvents: "none"
};

const cardTitle = {
  fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", marginBottom: "15px",
  color: "#fff", letterSpacing: "1px"
};

const cardText = {
  color: "#aaa", lineHeight: "1.7", fontSize: "0.95rem", marginBottom: "20px"
};

const techTag = {
  background: "rgba(0, 242, 255, 0.1)", border: "1px solid rgba(0, 242, 255, 0.3)",
  padding: "6px 12px", borderRadius: "6px", fontSize: "0.7rem", fontFamily: "'Fira Code', monospace",
  display: "inline-block", color: "#00f2ff", letterSpacing: "1px"
};

// ── New style for Threat Model section (matches existing mathGlass aesthetic) ──
const threatSection = {
  padding: "20px 5%", position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto"
};

const threatGlass = {
  background: "rgba(106, 17, 203, 0.04)", border: "1px solid rgba(106, 17, 203, 0.25)",
  padding: "35px 40px", borderRadius: "16px", textAlign: "center",
  boxShadow: "0 8px 32px rgba(106, 17, 203, 0.1)"
};

const guaranteeSection = {
  position: "relative", zIndex: 1, padding: "60px 5%", maxWidth: "1400px", margin: "0 auto"
};

const guaranteeGrid = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "25px"
};

const guaranteeCard = {
  background: "rgba(0, 255, 136, 0.03)", border: "1px solid rgba(0, 255, 136, 0.2)",
  padding: "30px 25px", borderRadius: "12px", display: "flex", flexDirection: "column",
  alignItems: "center", textAlign: "center", transition: "all 0.3s ease"
};

const guaranteeTitle = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "#fff",
  margin: "15px 0 10px",
  letterSpacing: "0.5px"
};

const guaranteeText = {
  color: "#aaa",
  fontSize: "0.9rem",
  lineHeight: "1.6",
  margin: 0
};

const mathSection = { 
  padding: "60px 5%", position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto"
};

const mathGlass = {
  background: "rgba(0, 242, 255, 0.02)", border: "1px solid rgba(0, 242, 255, 0.15)",
  padding: "50px 40px", borderRadius: "20px", textAlign: "center",
  boxShadow: "0 8px 32px rgba(0, 242, 255, 0.1)"
};

const formulaBox = {
  fontFamily: "'Fira Code', monospace", fontSize: "1.2rem", color: "#00ffcc",
  padding: "30px", background: "rgba(0, 0, 0, 0.5)", borderRadius: "12px", margin: "25px auto",
  maxWidth: "600px", border: "1px solid #333", 
  boxShadow: "inset 0 0 30px rgba(0, 255, 204, 0.1), 0 0 20px rgba(0, 242, 255, 0.2)"
};

const warningBox = {
  background: "rgba(255, 165, 0, 0.05)", border: "1px solid rgba(255, 165, 0, 0.3)",
  padding: "15px 20px", borderRadius: "8px", marginTop: "30px", display: "flex",
  alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: "#ffaa00",
  fontFamily: "'Fira Code', monospace"
};

const useCaseSection = {
  position: "relative", zIndex: 1, padding: "60px 5%", maxWidth: "1400px", margin: "0 auto"
};

const useCaseGrid = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px"
};

const useCaseCard = {
  background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.08)", padding: "35px 30px", borderRadius: "16px",
  textAlign: "center", transition: "all 0.3s ease"
};

const useCaseIconContainer = {
  marginBottom: "20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const useCaseTitle = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "1.3rem",
  fontWeight: "700",
  color: "#fff",
  margin: "0 0 15px",
  letterSpacing: "0.5px"
};

const useCaseText = {
  color: "#aaa",
  fontSize: "0.95rem",
  lineHeight: "1.7",
  margin: 0
};

const footer = {
  textAlign: "center", padding: "80px 20px 40px", color: "#444", fontSize: "0.75rem",
  letterSpacing: "2px", fontFamily: "'Orbitron', sans-serif", position: "relative", zIndex: 1
};