import React, { useRef, useState } from "react";

const FONT_DISPLAY = "'JetBrains Mono', 'Space Mono', monospace";
const FONT_BODY =
  "'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const uid = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_BLOCKS = [
  { id: "grass", name: "Grass", color: "#6B9B7C" },
  { id: "water", name: "Water", color: "#4A7FA6" },
  { id: "path", name: "Path", color: "#C9A876" },
  { id: "rock", name: "Rock", color: "#8B8378" },
  { id: "tree", name: "Tree", color: "#3F6B4A" },
];

export const makeDefaultTilemap = () => ({
  blocks: DEFAULT_BLOCKS.map((b) => ({ ...b })),
  grid: {},
});

// Fixed at 10x14 so the whole board fits on a phone screen without
// scrolling — matches the reference engine's "grid always fits, no pan/zoom
// needed" approach, just sized for this layout instead of its 9x6.
const COLS = 10;
const ROWS = 14;

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

export default function TilemapPainter({ c, fs, data, onChange }) {
  const tilemap = data || makeDefaultTilemap();
  const { blocks, grid } = tilemap;
  const [activeTool, setActiveTool] = useState(blocks[0]?.id || null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#8CA0BC");
  const paintingRef = useRef(false);
  const gridRef = useRef(null);

  const blockById = (id) => blocks.find((b) => b.id === id);

  const cellFromEvent = (e) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x / rect.width) * COLS);
    const row = Math.floor((y / rect.height) * ROWS);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return `${col},${row}`;
  };

  const paintAt = (key) => {
    if (!key) return;
    const current = grid[key];
    if (activeTool === "erase") {
      if (current === undefined) return;
      const next = { ...grid };
      delete next[key];
      onChange({ ...tilemap, grid: next });
    } else if (activeTool && current !== activeTool) {
      onChange({ ...tilemap, grid: { ...grid, [key]: activeTool } });
    }
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    paintingRef.current = true;
    paintAt(cellFromEvent(e));
  };
  const handlePointerMove = (e) => {
    if (!paintingRef.current) return;
    paintAt(cellFromEvent(e));
  };
  const stopPainting = (e) => {
    paintingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {
      // pointer may already be released — safe to ignore
    }
  };

  const addBlock = () => {
    const name = newName.trim();
    if (!name) return;
    const block = { id: uid(), name, color: newColor };
    onChange({ ...tilemap, blocks: [...blocks, block] });
    setActiveTool(block.id);
    setNewName("");
    setNewColor("#8CA0BC");
    setAdding(false);
  };

  const clearGrid = () => onChange({ ...tilemap, grid: {} });

  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      const key = `${col},${r}`;
      const b = grid[key] ? blockById(grid[key]) : null;
      cells.push(
        <div
          key={key}
          style={{
            background: b ? b.color : "transparent",
            borderRight: `1px solid ${c.bgGridStrong}`,
            borderBottom: `1px solid ${c.bgGridStrong}`,
          }}
        />
      );
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div
        ref={gridRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopPainting}
        onPointerLeave={stopPainting}
        style={{
          margin: "14px 14px 10px",
          aspectRatio: `${COLS} / ${ROWS}`,
          maxHeight: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${c.border}`,
          background: c.bg,
          touchAction: "none",
          cursor: "crosshair",
        }}
      >
        {cells}
      </div>

      <div
        style={{
          display: "flex",
          gap: 7,
          padding: "0 14px 8px",
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => setActiveTool("erase")}
          style={chipStyle(c, fs, activeTool === "erase")}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              border: `1.5px dashed ${c.textFaint}`,
              display: "inline-block",
            }}
          />
          Erase
        </button>
        {blocks.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveTool(b.id)}
            style={chipStyle(c, fs, activeTool === b.id)}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: b.color,
                display: "inline-block",
              }}
            />
            {b.name}
          </button>
        ))}
        <button
          onClick={() => setAdding((v) => !v)}
          style={chipStyle(c, fs, adding, true)}
        >
          + Block
        </button>
      </div>

      {adding && (
        <div
          style={{
            padding: "0 14px 10px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBlock()}
            placeholder="Block name"
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
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
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
            onClick={addBlock}
            style={{
              background: c.accent,
              color: c.accentText,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontFamily: FONT_DISPLAY,
              fontSize: fs - 3,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>
      )}

      <div
        style={{
          padding: "0 14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: fs - 3.5,
            color: c.textFaint,
          }}
        >
          {Object.keys(grid).length} tile{Object.keys(grid).length === 1 ? "" : "s"} placed
        </span>
        <button
          onClick={clearGrid}
          disabled={Object.keys(grid).length === 0}
          style={{
            background: "transparent",
            border: `1px solid ${c.border}`,
            color: c.danger,
            borderRadius: 8,
            padding: "6px 11px",
            fontFamily: FONT_BODY,
            fontSize: fs - 3,
            cursor: Object.keys(grid).length ? "pointer" : "default",
            opacity: Object.keys(grid).length ? 1 : 0.4,
          }}
        >
          Clear map
        </button>
      </div>
    </div>
  );
}
