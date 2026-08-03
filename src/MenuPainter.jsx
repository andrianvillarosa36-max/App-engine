import React, { useRef, useState } from "react";
import { Type as TypeIcon, Square, Palette, X, Trash2 } from "lucide-react";

const FONT_DISPLAY = "'JetBrains Mono', 'Space Mono', monospace";
const FONT_BODY =
  "'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const uid = () => Math.random().toString(36).slice(2, 9);

export const makeDefaultMenu = () => ({
  background: "#161E30",
  elements: [
    { id: uid(), type: "text", x: 50, y: 22, text: "Your Game Title", color: "#EBF0F7" },
    { id: uid(), type: "button", x: 50, y: 52, text: "Play", color: "#E8A33D" },
    { id: uid(), type: "button", x: 50, y: 66, text: "Settings", color: "#3F6B4A" },
  ],
});

function chipStyle(c, fs, active, dashed) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    background: active ? c.panelRaised : c.panel,
    border: `1px solid ${active ? c.accent : c.border}`,
    borderStyle: dashed ? "dashed" : "solid",
    borderRadius: 8,
    padding: "7px 10px",
    fontFamily: FONT_BODY,
    fontSize: fs - 2.5,
    color: active ? c.text : c.textMuted,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

export default function MenuPainter({ c, fs, data, onChange }) {
  const menu = data || makeDefaultMenu();
  const { background, elements } = menu;
  const [selectedId, setSelectedId] = useState(null);
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const canvasRef = useRef(null);
  const dragState = useRef(null);

  const selected = elements.find((el) => el.id === selectedId) || null;

  const updateElement = (id, patch) =>
    onChange({
      ...menu,
      elements: elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    });

  const addElement = (type) => {
    const el = {
      id: uid(),
      type,
      x: 50,
      y: 40,
      text: type === "button" ? "New Button" : "New Text",
      color: type === "button" ? "#E8A33D" : c.text,
    };
    onChange({ ...menu, elements: [...elements, el] });
    setSelectedId(el.id);
  };

  const removeElement = (id) => {
    onChange({ ...menu, elements: elements.filter((el) => el.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const handleElementPointerDown = (e, el) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(el.id);
    dragState.current = { id: el.id, pointerId: e.pointerId };
  };

  const handleCanvasPointerMove = (e) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(4, Math.min(96, x));
    y = Math.max(5, Math.min(95, y));
    updateElement(drag.id, { x, y });
  };

  const stopDrag = () => {
    dragState.current = null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div
        ref={canvasRef}
        onPointerDown={() => setSelectedId(null)}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
        style={{
          margin: "14px 14px 10px",
          flex: 1,
          minHeight: 260,
          position: "relative",
          borderRadius: 14,
          border: `1px dashed ${c.border}`,
          background,
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        {elements.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 24,
              fontFamily: FONT_BODY,
              fontSize: fs - 1,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Tap + Button or + Text below to start building this screen
          </div>
        )}
        {elements.map((el) => {
          const isSelected = el.id === selectedId;
          return (
            <div
              key={el.id}
              onPointerDown={(e) => handleElementPointerDown(e, el)}
              style={{
                position: "absolute",
                left: `${el.x}%`,
                top: `${el.y}%`,
                transform: "translate(-50%, -50%)",
                cursor: "grab",
                outline: isSelected ? `2px dashed ${c.accent}` : "none",
                outlineOffset: 4,
                borderRadius: el.type === "button" ? 8 : 4,
              }}
            >
              {el.type === "button" ? (
                <div
                  style={{
                    background: el.color,
                    color: "#FFFFFF",
                    fontFamily: FONT_DISPLAY,
                    fontSize: fs - 2,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                    padding: "10px 22px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    userSelect: "none",
                  }}
                >
                  {el.text}
                </div>
              ) : (
                <div
                  style={{
                    color: el.color,
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    fontSize: fs + 2,
                    whiteSpace: "nowrap",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    userSelect: "none",
                  }}
                >
                  {el.text}
                </div>
              )}
              {isSelected && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(el.id);
                  }}
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "none",
                    background: c.danger,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 7, padding: "0 14px 8px", overflowX: "auto" }}>
        <button onClick={() => addElement("button")} style={chipStyle(c, fs, false)}>
          <Square size={12} /> + Button
        </button>
        <button onClick={() => addElement("text")} style={chipStyle(c, fs, false)}>
          <TypeIcon size={12} /> + Text
        </button>
        <button
          onClick={() => setBgPickerOpen((v) => !v)}
          style={chipStyle(c, fs, bgPickerOpen)}
        >
          <Palette size={12} /> Background
        </button>
      </div>

      {bgPickerOpen && (
        <div
          style={{
            padding: "0 14px 10px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: fs - 2,
              color: c.textMuted,
            }}
          >
            Screen color
          </span>
          <input
            type="color"
            value={background}
            onChange={(e) => onChange({ ...menu, background: e.target.value })}
            style={{
              width: 36,
              height: 34,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              background: "none",
              padding: 2,
            }}
          />
        </div>
      )}

      {selected && (
        <div
          style={{
            padding: "0 14px 16px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            value={selected.text}
            onChange={(e) => updateElement(selected.id, { text: e.target.value })}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: FONT_BODY,
              fontSize: fs - 1,
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.panel,
              color: c.text,
            }}
          />
          <input
            type="color"
            value={selected.color}
            onChange={(e) => updateElement(selected.id, { color: e.target.value })}
            style={{
              width: 36,
              height: 34,
              border: `1px solid ${c.border}`,
              borderRadius: 6,
              background: "none",
              padding: 2,
              flexShrink: 0,
            }}
          />
          <button
            onClick={() => removeElement(selected.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "transparent",
              border: `1px solid ${c.border}`,
              color: c.danger,
              borderRadius: 8,
              padding: "8px 10px",
              fontFamily: FONT_BODY,
              fontSize: fs - 3,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
