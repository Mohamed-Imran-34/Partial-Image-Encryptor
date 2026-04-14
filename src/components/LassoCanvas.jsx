import { useRef, useState, useEffect } from "react";
import { Scissors, Paintbrush, Square, Circle, Undo2, Redo2, X } from "lucide-react";

export default function LassoCanvas({ src, onComplete }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  
  const [tool, setTool] = useState("free");
  const [brushSize, setBrushSize] = useState(40); 
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [selections, setSelections] = useState([]); 
  const [redoStack, setRedoStack] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    setPoints([]); setSelections([]); setRedoStack([]);
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!imgRef.current?.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    const drawShape = (shape, color, isCurrent) => {
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const { type, data } = shape;
      ctx.beginPath();

      if (type === "free") {
        ctx.lineWidth = Math.max(2, canvas.width / 1000);
        if (data.length < 2) return;
        ctx.moveTo(data[0].x, data[0].y);
        data.forEach(p => ctx.lineTo(p.x, p.y));
        if (!isCurrent) ctx.closePath();
        ctx.stroke();
      } 
      else if (type === "brush") {
        ctx.lineWidth = data.size; 
        if (data.points.length < 1) return;
        ctx.moveTo(data.points[0].x, data.points[0].y);
        data.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      else if (type === "rect") {
        ctx.lineWidth = Math.max(2, canvas.width / 1000);
        ctx.strokeRect(data.start.x, data.start.y, data.end.x - data.start.x, data.end.y - data.start.y);
      } 
      else if (type === "circle") {
        ctx.lineWidth = Math.max(2, canvas.width / 1000);
        ctx.arc(data.center.x, data.center.y, data.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    selections.forEach(sel => drawShape(sel, "#00f2ff", false));

    if (drawing && points.length > 0) {
      const start = points[0];
      const end = points[points.length - 1];
      let currentShape = { type: tool };

      if (tool === "free") currentShape.data = points;
      else if (tool === "brush") currentShape.data = { points, size: brushSize };
      else if (tool === "rect") currentShape.data = { start, end };
      else if (tool === "circle") {
        const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
        currentShape.data = { center, radius };
      }
      drawShape(currentShape, "#ffaa00", true);
    }

    if (tool === "brush" && mousePos.x > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 242, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.arc(mousePos.x, mousePos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 242, 255, 0.5)";
      ctx.arc(mousePos.x, mousePos.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [points, selections, drawing, tool, brushSize, mousePos]);

  // ── Coordinate helpers ──────────────────────────────────────────────────────

  const getPos = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = Math.min(rect.width / canvasRef.current.width, rect.height / canvasRef.current.height);
    const xOffset = (rect.width - canvasRef.current.width * scale) / 2;
    const yOffset = (rect.height - canvasRef.current.height * scale) / 2;
    return { x: (e.clientX - rect.left - xOffset) / scale, y: (e.clientY - rect.top - yOffset) / scale };
  };

  // Same logic as getPos but accepts a Touch object
  const getTouchPos = touch => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = Math.min(rect.width / canvasRef.current.width, rect.height / canvasRef.current.height);
    const xOffset = (rect.width - canvasRef.current.width * scale) / 2;
    const yOffset = (rect.height - canvasRef.current.height * scale) / 2;
    return { x: (touch.clientX - rect.left - xOffset) / scale, y: (touch.clientY - rect.top - yOffset) / scale };
  };

  // ── Mask generation ─────────────────────────────────────────────────────────

  const generateMask = (sels) => {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvasRef.current.width;
    maskCanvas.height = canvasRef.current.height;
    const mctx = maskCanvas.getContext("2d");
    mctx.fillStyle = "white";
    mctx.strokeStyle = "white";
    mctx.lineCap = "round";
    mctx.lineJoin = "round";

    sels.forEach(({ type, data }) => {
      mctx.beginPath();
      if (type === "free") {
        mctx.moveTo(data[0].x, data[0].y);
        data.forEach(p => mctx.lineTo(p.x, p.y));
        mctx.closePath(); mctx.fill();
      } else if (type === "brush") {
        mctx.lineWidth = data.size;
        mctx.moveTo(data.points[0].x, data.points[0].y);
        data.points.forEach(p => mctx.lineTo(p.x, p.y));
        mctx.stroke();
      } else if (type === "rect") {
        mctx.fillRect(data.start.x, data.start.y, data.end.x - data.start.x, data.end.y - data.start.y);
      } else if (type === "circle") {
        mctx.arc(data.center.x, data.center.y, data.radius, 0, Math.PI * 2);
        mctx.fill();
      }
    });
    return maskCanvas;
  };

  // ── Shared finish logic ─────────────────────────────────────────────────────

  const finish = () => {
    if (!drawing) return;
    setDrawing(false);
    const start = points[0];
    const end = points[points.length - 1];
    let newShape = { type: tool };

    if (tool === "free" || tool === "brush") {
      if (points.length < 1) return;
      newShape.data = tool === "free" ? points : { points, size: brushSize };
    } else if (tool === "rect") {
      newShape.data = { start, end };
    } else if (tool === "circle") {
      newShape.data = { 
        center: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }, 
        radius: Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2 
      };
    }

    setSelections(prev => {
      const updated = [...prev, newShape];
      setRedoStack([]);
      onComplete(generateMask(updated));
      return updated;
    });
    setPoints([]);
  };

  // ── Mouse handlers (unchanged) ──────────────────────────────────────────────

  const handleMouseDown = e => {
    setPoints([getPos(e)]);
    setDrawing(true);
  };

  const handleMouseMove = e => {
    const pos = getPos(e);
    setMousePos(pos);
    if (drawing) {
      setPoints(prev => (tool === "free" || tool === "brush") ? [...prev, pos] : [prev[0], pos]);
    }
  };

  const handleMouseUp = () => finish();

  const handleMouseLeave = () => {
    setMousePos({ x: -100, y: -100 });
    finish();
  };

  // ── Touch handlers ──────────────────────────────────────────────────────────

  const handleTouchStart = e => {
    e.preventDefault(); // prevent scroll / zoom while drawing
    const touch = e.touches[0];
    if (!touch) return;
    const pos = getTouchPos(touch);
    setPoints([pos]);
    setDrawing(true);
  };

  const handleTouchMove = e => {
    e.preventDefault(); // prevent scroll / zoom while drawing
    const touch = e.touches[0];
    if (!touch) return;
    const pos = getTouchPos(touch);
    // Mirror brush cursor for touch (optional visual feedback)
    setMousePos(pos);
    if (drawing) {
      setPoints(prev => (tool === "free" || tool === "brush") ? [...prev, pos] : [prev[0], pos]);
    }
  };

  const handleTouchEnd = e => {
    e.preventDefault();
    setMousePos({ x: -100, y: -100 }); // hide brush cursor
    finish();
  };

  const handleTouchCancel = e => {
    e.preventDefault();
    setMousePos({ x: -100, y: -100 });
    setDrawing(false);
    setPoints([]);
  };

  // ── Undo / Redo ─────────────────────────────────────────────────────────────

  const undo = () => {
    if (selections.length === 0) return;
    const updated = [...selections];
    const last = updated.pop();
    setRedoStack(p => [...p, last]);
    setSelections(updated);
    onComplete(generateMask(updated));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const updatedRedo = [...redoStack];
    const item = updatedRedo.pop();
    const updatedSels = [...selections, item];
    setRedoStack(updatedRedo);
    setSelections(updatedSels);
    onComplete(generateMask(updatedSels));
  };

  return (
    <div style={wrapperStyle}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&family=Fira+Code&display=swap');
          
          .tool-btn-hover:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 242, 255, 0.4);
          }
          
          .tool-btn-hover:active:not(:disabled) {
            transform: translateY(0);
          }

          @media (max-width: 1024px) {
            .tool-group {
              padding: 0 10px !important;
            }
            .tool-btn {
              padding: 8px 12px !important;
              font-size: 13px !important;
            }
            .tool-btn svg {
              width: 14px !important;
              height: 14px !important;
            }
          }

          @media (max-width: 768px) {
            .toolbar-responsive {
              flex-direction: column !important;
              gap: 12px !important;
              padding: 15px !important;
            }
            .tool-group {
              border-right: none !important;
              border-bottom: 1px solid rgba(0, 242, 255, 0.2) !important;
              padding: 10px 0 !important;
              width: 100%;
              justify-content: center !important;
            }
            .tool-group:last-child {
              border-bottom: none !important;
            }
            .brush-controls {
              flex-direction: column !important;
              align-items: flex-start !important;
              width: 100%;
            }
            .brush-controls input[type="range"] {
              width: 100% !important;
            }
          }

          @media (max-width: 480px) {
            .tool-btn {
              padding: 8px 10px !important;
              font-size: 12px !important;
            }
            .tool-btn-text {
              display: none !important;
            }
            .tool-group {
              gap: 6px !important;
            }
          }
        `}
      </style>

      <img ref={imgRef} src={src} hidden onLoad={() => {
        canvasRef.current.width = imgRef.current.naturalWidth;
        canvasRef.current.height = imgRef.current.naturalHeight;
      }} />

      <div style={toolbarStyle} className="toolbar-responsive">
        <div style={groupStyle} className="tool-group">
          <button 
            onClick={() => setTool("free")} 
            style={tool === "free" ? activeBtn : btn}
            className="tool-btn-hover tool-btn"
          >
            <Scissors size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Lasso</span>
          </button>
          <button 
            onClick={() => setTool("brush")} 
            style={tool === "brush" ? activeBtn : btn}
            className="tool-btn-hover tool-btn"
          >
            <Paintbrush size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Brush</span>
          </button>
          <button 
            onClick={() => setTool("rect")} 
            style={tool === "rect" ? activeBtn : btn}
            className="tool-btn-hover tool-btn"
          >
            <Square size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Square</span>
          </button>
          <button 
            onClick={() => setTool("circle")} 
            style={tool === "circle" ? activeBtn : btn}
            className="tool-btn-hover tool-btn"
          >
            <Circle size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Circle</span>
          </button>
        </div>

        {tool === "brush" && (
          <div style={groupStyle} className="tool-group brush-controls">
            <label style={labelStyle}>Brush Size:</label>
            <input 
              type="range" min="10" max="200" value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))} 
              style={rangeStyle}
            />
            <span style={sizeDisplayStyle}>{brushSize}px</span>
          </div>
        )}

        <div style={groupStyle} className="tool-group">
          <button 
            onClick={undo} 
            disabled={selections.length === 0} 
            style={btn}
            className="tool-btn-hover tool-btn"
          >
            <Undo2 size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Undo</span>
          </button>
          <button 
            onClick={redo} 
            disabled={redoStack.length === 0} 
            style={btn}
            className="tool-btn-hover tool-btn"
          >
            <Redo2 size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Redo</span>
          </button>
          <button 
            onClick={() => { setSelections([]); onComplete(generateMask([])); }} 
            style={clearBtn}
            className="tool-btn-hover tool-btn"
          >
            <X size={16} style={{marginRight: '6px'}} />
            <span className="tool-btn-text">Clear</span>
          </button>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        style={{...canvasStyle, cursor: tool === "brush" ? "none" : "crosshair"}} 
        // ── Mouse events (unchanged) ──
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        // ── Touch events ──
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      />
    </div>
  );
}

const wrapperStyle = {
  textAlign: "center",
  padding: "20px",
  background: "linear-gradient(180deg, rgba(5, 5, 8, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)",
  borderRadius: "16px",
  margin: "20px auto",
  maxWidth: "95%",
  boxSizing: "border-box",  // ← fix: padding is now included in the 95% width
  overflow: "hidden",       // ← fix: clip any content that still tries to escape
};

const toolbarStyle = { 
  margin: "20px auto", 
  display: "flex", 
  justifyContent: "center", 
  gap: "20px", 
  flexWrap: "wrap", 
  alignItems: "center", 
  background: "rgba(0, 0, 0, 0.6)", 
  backdropFilter: "blur(10px)",
  padding: "20px", 
  borderRadius: "12px", 
  border: "1px solid rgba(0, 242, 255, 0.2)",
  boxShadow: "0 4px 20px rgba(0, 242, 255, 0.1)",
  maxWidth: "100%",
  overflow: "hidden"
};

const groupStyle = { 
  display: "flex", 
  gap: "10px", 
  alignItems: "center", 
  padding: "0 15px", 
  borderRight: "1px solid rgba(0, 242, 255, 0.2)",
  flexWrap: "wrap"
};

const btn = { 
  padding: "10px 18px", 
  cursor: "pointer", 
  borderRadius: "8px", 
  border: "1px solid rgba(0, 242, 255, 0.3)", 
  background: "rgba(0, 0, 0, 0.4)", 
  color: "#fff",
  fontWeight: "600", 
  fontSize: "14px",
  fontFamily: "'Orbitron', sans-serif",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  whiteSpace: "nowrap"
};

const activeBtn = { 
  ...btn, 
  background: "linear-gradient(135deg, #00f2ff 0%, #2575fc 100%)", 
  color: "#000", 
  borderColor: "#00f2ff",
  boxShadow: "0 4px 20px rgba(0, 242, 255, 0.5)"
};

const clearBtn = { 
  ...btn, 
  color: "#ff5555",
  borderColor: "rgba(255, 85, 85, 0.5)"
};

const labelStyle = {
  fontWeight: "700",
  fontSize: "0.85rem",
  color: "#00f2ff",
  fontFamily: "'Fira Code', monospace",
  letterSpacing: "0.5px",
  whiteSpace: "nowrap"
};

const rangeStyle = {
  cursor: "pointer",
  accentColor: "#00f2ff",
  width: "120px",
  minWidth: "80px"
};

const sizeDisplayStyle = {
  minWidth: "45px",
  fontFamily: "'Fira Code', monospace",
  color: "#00f2ff",
  fontWeight: "bold",
  fontSize: "0.9rem",
  textAlign: "center"
};

const canvasStyle = { 
  border: "2px solid rgba(0, 242, 255, 0.4)", 
  width: "100%",            // ← fix: fills wrapper width instead of fixed 85vw
  maxWidth: "1200px",       // ← unchanged cap for large screens
  height: "60vh", 
  display: "block", 
  margin: "20px auto", 
  objectFit: "contain", 
  background: "rgba(10, 10, 20, 0.8)", 
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 242, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)",
  touchAction: "none",
  boxSizing: "border-box",  // ← fix: border is included in the 100% width
};