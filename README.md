# VaultPixel SRPF 🛡️
### Selective ROI-Based Reversible Protection Framework

**VaultPixel SRPF** is a browser-native security tool designed to address the vulnerabilities of traditional image redaction like blurring or pixelation. Instead of permanently destroying data, it allows users to define a **Region of Interest (ROI)** and replace it with cryptographically secure, high-entropy noise.

Authorized users can reverse the process to achieve **lossless, bit-perfect restoration** of the original pixels using a secure key.


## ✨ Key Features
- **Zero-Server Architecture:** All cryptographic operations occur in the browser's RAM. Your images are never uploaded to a server, ensuring total data sovereignty.
- **Precision ROI Selection:** Custom-built Lasso and Brush engines for selecting irregular shapes, providing better flexibility than standard rectangular masks.
- **Lossless Restoration:** 100% bit-accurate recovery of original pixels upon successful decryption.
- **Maximum-Entropy Scrambling:** ROI is replaced with CSPRNG-generated noise to defeat statistical and histogram-based attacks.
- **Optimized Storage:** A hybrid RLE-DEFLATE compression pipeline minimizes the size of the encrypted `.bin` sidecar file for easy sharing.



## 🛠️ Tech Stack
- **Frontend:** React , Lucide React (Icons)
- **Security:** Web Crypto API (AES-256-GCM, PBKDF2), CSPRNG
- **Processing:** HTML5 Canvas API, Pako (DEFLATE implementation)



## 📐 How it Works
1. **Selection:** The user draws an ROI using the Lasso or Brush tool on the Canvas interface.
2. **Extraction:** The system maps the coordinates and extracts raw RGB pixel data from the selected region.
3. **Encryption:** - A secure key is derived via **PBKDF2** with 100,000 iterations.
    - The pixel payload is encrypted via **AES-256-GCM** to ensure both confidentiality and integrity.
4. **Obfuscation:** The ROI on the original image is filled with high-entropy random noise.
5. **Recovery:** By providing the correct password and the `.bin` metadata file, the system re-inserts the original pixels into their exact coordinates.


