import React, { useState, useRef } from "react";
import {
  Home as HomeIcon,
  FolderOpen,
  PlusCircle,
  Settings as SettingsIcon,
  MoreVertical,
  GripVertical,
  ChevronLeft,
  Sun,
  Moon,
  Trash2,
  Pencil,
  Map as MapIcon,
  LayoutTemplate,
  Shield,
  Info,
  MessageSquare,
  Trash,
  Check,
  X,
  Layers,
  Users,
} from "lucide-react";
import TilemapPainter, { makeDefaultTilemap } from "./TilemapPainter.jsx";
import MenuPainter, { makeDefaultMenu } from "./MenuPainter.jsx";

// ---------------------------------------------------------------------------
// Token system
//   Subject: a mobile tool for building 2D tile-based games. The signature
//   idea is "blueprint paper" — everything sits on a faint coordinate grid,
//   like a level designer's graph paper, with project tiles pinned to it.
// ---------------------------------------------------------------------------
const THEMES = {
  dark: {
    bg: "#121826",
    bgGrid: "rgba(148,180,214,0.07)",
    bgGridStrong: "rgba(148,180,214,0.14)",
    panel: "#1B2438",
    panelRaised: "#212C45",
    border: "rgba(148,180,214,0.16)",
    text: "#EBF0F7",
    textMuted: "#8DA0BE",
    textFaint: "#5C6B87",
    accent: "#E8A33D",
    accentText: "#1A1406",
    danger: "#E08585",
    success: "#7FC49A",
    navBg: "#161E30",
  },
  light: {
    bg: "#F1EEE3",
    bgGrid: "rgba(40,54,76,0.06)",
    bgGridStrong: "rgba(40,54,76,0.12)",
    panel: "#FBF9F1",
    panelRaised: "#FFFFFF",
    border: "rgba(40,54,76,0.14)",
    text: "#1D2536",
    textMuted: "#5B6478",
    textFaint: "#8B93A5",
    accent: "#C4842A",
    accentText: "#FFF9EE",
    danger: "#B84C46",
    success: "#3F8A5F",
    navBg: "#E7E2D2",
  },
};

const FONT_DISPLAY = "'JetBrains Mono', 'Space Mono', monospace";
const FONT_BODY =
  "'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const TEXT_SIZES = { Small: 13, Standard: 14.5, Large: 16.5 };

const PROJECT_TYPES = [
  {
    id: "menu",
    label: "Game Menu",
    icon: LayoutTemplate,
    blurb: "Titles, buttons, menu flow",
  },
  {
    id: "gameplay",
    label: "Game Gameplay (Tilemap)",
    icon: MapIcon,
    blurb: "Terrain, NPCs, characters, events",
  },
  {
    id: "combined",
    label: "Menu + Gameplay",
    icon: Layers,
    blurb: "Both editors, one project",
  },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const seedProjects = () => [
  { id: uid(), name: "Ashfall Ruins", type: "combined", tiles: 812, updated: "2d ago" },
  { id: uid(), name: "Sable Coast", type: "gameplay", tiles: 340, updated: "5d ago" },
  { id: uid(), name: "Title Screen — v2", type: "menu", tiles: 0, updated: "1w ago" },
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function Eyebrow({ children, c }) {
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: c.textFaint,
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function GridBackdrop({ c, children, style }) {
  return (
    <div
      style={{
        backgroundColor: c.bg,
        backgroundImage: `linear-gradient(${c.bgGrid} 1px, transparent 1px), linear-gradient(90deg, ${c.bgGrid} 1px, transparent 1px), linear-gradient(${c.bgGridStrong} 1px, transparent 1px), linear-gradient(90deg, ${c.bgGridStrong} 1px, transparent 1px)`,
        backgroundSize: "10px 10px, 10px 10px, 50px 50px, 50px 50px",
        backgroundPosition: "-1px -1px, -1px -1px, -1px -1px, -1px -1px",
        height: "100%",
        width: "100%",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, c, size = 18, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 9,
        border: "none",
        background: "transparent",
        color: c.textMuted,
        cursor: "pointer",
      }}
    >
      <Icon size={size} strokeWidth={2} />
    </button>
  );
}

function PrimaryButton({ children, onClick, c, disabled, fs }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: (fs || 14) - 1,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        background: disabled ? c.textFaint : c.accent,
        color: c.accentText,
        border: "none",
        borderRadius: 10,
        padding: "13px 18px",
        width: "100%",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 120ms ease",
      }}
    >
      {children}
    </button>
  );
}

function TopBar({ title, onBack, c, fs, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 14px 14px",
        borderBottom: `1px solid ${c.border}`,
        background: c.bg,
      }}
    >
      {onBack ? (
        <IconBtn icon={ChevronLeft} onClick={onBack} c={c} />
      ) : (
        <div style={{ width: 34 }} />
      )}
      <div
        style={{
          flex: 1,
          fontFamily: FONT_DISPLAY,
          fontSize: fs + 2,
          color: c.text,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </div>
      {right || <div style={{ width: 34 }} />}
    </div>
  );
}

function BottomNav({ screen, setScreen, c, fs }) {
  const items = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "create", label: "Create", icon: PlusCircle },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div
      style={{
        display: "flex",
        borderTop: `1px solid ${c.border}`,
        background: c.navBg,
        padding: "8px 4px 12px",
      }}
    >
      {items.map((it) => {
        const active = screen === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setScreen(it.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px 0",
            }}
          >
            <Icon
              size={19}
              strokeWidth={active ? 2.4 : 1.8}
              color={active ? c.accent : c.textFaint}
            />
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: fs - 5.5,
                letterSpacing: "0.04em",
                color: active ? c.accent : c.textFaint,
                textTransform: "uppercase",
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function typeIcon(type) {
  if (type === "menu") return LayoutTemplate;
  if (type === "gameplay") return MapIcon;
  return Layers;
}
function typeLabel(type) {
  if (type === "menu") return "Menu";
  if (type === "gameplay") return "Gameplay";
  return "Menu + Gameplay";
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
function HomeScreen({ c, fs, setScreen, projectCount }) {
  return (
    <GridBackdrop c={c} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "34px 22px 0" }}>
        <Eyebrow c={c}>Coordinate 0,0</Eyebrow>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: fs + 12,
            color: c.text,
            lineHeight: 1.15,
            marginBottom: 14,
          }}
        >
          Tile&shy;Forge
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: fs + 1,
            color: c.textMuted,
            lineHeight: 1.55,
            maxWidth: 260,
          }}
        >
          Build game menus and tile-based worlds on your phone. Lay down
          terrain, place characters, and wire up events — one grid square at
          a time.
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_DISPLAY,
            fontSize: fs - 3,
            color: c.textFaint,
            letterSpacing: "0.05em",
          }}
        >
          {projectCount} PROJECT{projectCount === 1 ? "" : "S"} ON THE BOARD
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={() => setScreen("create")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: c.accent,
          color: c.accentText,
          border: "none",
          borderRadius: 999,
          padding: "14px 20px",
          fontFamily: FONT_DISPLAY,
          fontSize: fs - 2,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
          cursor: "pointer",
        }}
      >
        <PlusCircle size={17} strokeWidth={2.2} />
        Create Project
      </button>
    </GridBackdrop>
  );
}

function ProjectCard({ p, c, fs, onOpen, onRename, onDelete, dragProps }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(p.name);
  const Icon = typeIcon(p.type);

  return (
    <div
      {...dragProps}
      style={{
        background: c.panel,
        border: `1px dashed ${c.border}`,
        borderRadius: 12,
        padding: "13px 12px",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
        position: "relative",
      }}
    >
      <div style={{ color: c.textFaint, cursor: "grab", display: "flex" }}>
        <GripVertical size={16} />
      </div>
      <div
        onClick={() => !renaming && onOpen(p)}
        style={{
          flex: 1,
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        {renaming ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{
                fontFamily: FONT_BODY,
                fontSize: fs,
                color: c.text,
                background: c.panelRaised,
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                padding: "5px 8px",
                flex: 1,
                minWidth: 0,
              }}
            />
            <IconBtn
              icon={Check}
              c={c}
              size={15}
              onClick={() => {
                onRename(p.id, draft.trim() || p.name);
                setRenaming(false);
              }}
            />
            <IconBtn
              icon={X}
              c={c}
              size={15}
              onClick={() => {
                setDraft(p.name);
                setRenaming(false);
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 600,
                fontSize: fs + 0.5,
                color: c.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 3,
                color: c.textMuted,
              }}
            >
              <Icon size={12} strokeWidth={2} />
              <span style={{ fontFamily: FONT_BODY, fontSize: fs - 3.5 }}>
                {typeLabel(p.type)} · {p.updated}
              </span>
            </div>
          </>
        )}
      </div>
      {!renaming && (
        <div style={{ position: "relative" }}>
          <IconBtn
            icon={MoreVertical}
            c={c}
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 5 }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 36,
                  background: c.panelRaised,
                  border: `1px solid ${c.border}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  zIndex: 6,
                  minWidth: 128,
                  boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
                }}
              >
                <button
                  onClick={() => {
                    setRenaming(true);
                    setMenuOpen(false);
                  }}
                  style={menuItemStyle(c, fs)}
                >
                  <Pencil size={13} /> Rename
                </button>
                <button
                  onClick={() => {
                    onDelete(p.id);
                    setMenuOpen(false);
                  }}
                  style={{ ...menuItemStyle(c, fs), color: c.danger }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function menuItemStyle(c, fs) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "10px 12px",
    fontFamily: FONT_BODY,
    fontSize: fs - 1,
    color: c.text,
    cursor: "pointer",
    textAlign: "left",
  };
}

function ProjectsScreen({ c, fs, projects, setProjects, onOpen }) {
  const dragItem = useRef(null);
  const dragOver = useRef(null);

  const handleSort = () => {
    const list = [...projects];
    const dragged = list[dragItem.current];
    list.splice(dragItem.current, 1);
    list.splice(dragOver.current, 0, dragged);
    setProjects(list);
  };

  const rename = (id, name) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)));
  const remove = (id) => setProjects((ps) => ps.filter((p) => p.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Projects" c={c} fs={fs} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px" }}>
        {projects.length === 0 ? (
          <div
            style={{
              marginTop: 60,
              textAlign: "center",
              fontFamily: FONT_BODY,
              color: c.textMuted,
              fontSize: fs,
            }}
          >
            <Eyebrow c={c}>Empty board</Eyebrow>
            No projects yet. Tap Create to place your first tile.
          </div>
        ) : (
          projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              p={p}
              c={c}
              fs={fs}
              onOpen={onOpen}
              onRename={rename}
              onDelete={remove}
              dragProps={{
                draggable: true,
                onDragStart: () => (dragItem.current = i),
                onDragEnter: () => (dragOver.current = i),
                onDragEnd: handleSort,
                onDragOver: (e) => e.preventDefault(),
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CreateProjectScreen({ c, fs, onCreate, editingProject }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(editingProject ? editingProject.name : "");
  const [type, setType] = useState(editingProject ? editingProject.type : "");
  const [canvasSize, setCanvasSize] = useState("32 × 32");
  const [gridSnap, setGridSnap] = useState(true);

  const steps = ["Name", "Type", "Settings"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={editingProject ? "Edit Project" : "Create Project"} c={c} fs={fs} />

      <div style={{ display: "flex", gap: 6, padding: "14px 16px 0" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: i + 1 <= step ? c.accent : c.border,
                marginBottom: 6,
              }}
            />
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: fs - 6,
                letterSpacing: "0.06em",
                color: i + 1 === step ? c.text : c.textFaint,
                textTransform: "uppercase",
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "22px 18px" }}>
        {step === 1 && (
          <div>
            <Eyebrow c={c}>Step 1 of 3</Eyebrow>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: fs + 3,
                fontWeight: 600,
                color: c.text,
                marginBottom: 4,
              }}
            >
              Name your project
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: fs - 1,
                color: c.textMuted,
                marginBottom: 18,
              }}
            >
              You can rename it later from the Projects list.
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ashfall Ruins"
              style={{
                width: "100%",
                fontFamily: FONT_BODY,
                fontSize: fs + 1,
                color: c.text,
                background: c.panel,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: "13px 14px",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <Eyebrow c={c}>Step 2 of 3</Eyebrow>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: fs + 3,
                fontWeight: 600,
                color: c.text,
                marginBottom: 4,
              }}
            >
              Choose a project type
            </div>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: fs - 1,
                color: c.textMuted,
                marginBottom: 16,
              }}
            >
              Combine both editors, or build one at a time.
            </div>
            {PROJECT_TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    background: active ? c.panelRaised : c.panel,
                    border: `1.5px solid ${active ? c.accent : c.border}`,
                    borderRadius: 12,
                    padding: "13px 14px",
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: active ? c.accent : c.bgGridStrong,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={16}
                      color={active ? c.accentText : c.textMuted}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: FONT_BODY,
                        fontWeight: 600,
                        fontSize: fs,
                        color: c.text,
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: fs - 3,
                        color: c.textMuted,
                      }}
                    >
                      {t.blurb}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div>
            <Eyebrow c={c}>Step 3 of 3</Eyebrow>
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: fs + 3,
                fontWeight: 600,
                color: c.text,
                marginBottom: 18,
              }}
            >
              Project settings
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={labelStyle(c, fs)}>Canvas size</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["16 × 16", "32 × 32", "64 × 64"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setCanvasSize(sz)}
                    style={chipStyle(c, fs, canvasSize === sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: c.panel,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: fs,
                    color: c.text,
                  }}
                >
                  Snap to grid
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: fs - 3,
                    color: c.textMuted,
                  }}
                >
                  Recommended for tile alignment
                </div>
              </div>
              <Toggle on={gridSnap} onChange={setGridSnap} c={c} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 18px 20px", display: "flex", gap: 10 }}>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: fs - 2,
              color: c.textMuted,
              background: "transparent",
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              padding: "13px 18px",
              cursor: "pointer",
            }}
          >
            Back
          </button>
        )}
        <div style={{ flex: 1 }}>
          <PrimaryButton
            c={c}
            fs={fs}
            disabled={(step === 1 && !name.trim()) || (step === 2 && !type)}
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onCreate({ name: name.trim(), type, canvasSize, gridSnap });
            }}
          >
            {step < 3 ? "Continue" : "Create Project"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function labelStyle(c, fs) {
  return {
    fontFamily: FONT_DISPLAY,
    fontSize: fs - 5,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: c.textFaint,
    marginBottom: 8,
  };
}
function chipStyle(c, fs, active) {
  return {
    fontFamily: FONT_BODY,
    fontSize: fs - 2,
    color: active ? c.accentText : c.text,
    background: active ? c.accent : c.panel,
    border: `1px solid ${active ? c.accent : c.border}`,
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  };
}

function Toggle({ on, onChange, c }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: "none",
        background: on ? c.accent : c.border,
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: c.panelRaised,
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          transition: "left 140ms ease",
        }}
      />
    </button>
  );
}

function EditorScreen({
  c,
  fs,
  project,
  onBack,
  tilemapData,
  onTilemapChange,
  menuData,
  onMenuChange,
}) {
  const showBoth = project.type === "combined";
  const [tab, setTab] = useState(
    project.type === "gameplay" ? "gameplay" : "menu"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={project.name} onBack={onBack} c={c} fs={fs} />
      {showBoth && (
        <div style={{ display: "flex", padding: "10px 14px 0", gap: 8 }}>
          {["menu", "gameplay"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                fontFamily: FONT_DISPLAY,
                fontSize: fs - 4,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "9px 0",
                borderRadius: 8,
                border: `1px solid ${tab === t ? c.accent : c.border}`,
                background: tab === t ? c.panelRaised : "transparent",
                color: tab === t ? c.text : c.textFaint,
                cursor: "pointer",
              }}
            >
              {t === "menu" ? "Menu Editor" : "Tilemap Editor"}
            </button>
          ))}
        </div>
      )}

      {tab === "gameplay" ? (
        <TilemapPainter c={c} fs={fs} data={tilemapData} onChange={onTilemapChange} />
      ) : (
        <MenuPainter c={c} fs={fs} data={menuData} onChange={onMenuChange} />
      )}
    </div>
  );
}

function Row({ c, fs, label, sub, right, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 4px",
        borderBottom: `1px solid ${c.border}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div>
        <div style={{ fontFamily: FONT_BODY, fontSize: fs, color: c.text }}>
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: fs - 3.5,
              color: c.textMuted,
              marginTop: 2,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

function SettingsScreen({ c, fs, theme, setTheme, textSize, setTextSize }) {
  const [cache, setCache] = useState(48.2);
  const [clearing, setClearing] = useState(false);

  const clearCache = () => {
    setClearing(true);
    setTimeout(() => {
      setCache(0);
      setClearing(false);
    }, 700);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Settings" c={c} fs={fs} />
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 18px 24px" }}>
        <Eyebrow c={c}>Appearance</Eyebrow>
        <Row
          c={c}
          fs={fs}
          label="Theme"
          sub={theme === "dark" ? "Dark" : "Light"}
          right={
            <div style={{ display: "flex", gap: 6 }}>
              <IconBtn
                icon={Sun}
                c={c}
                onClick={() => setTheme("light")}
                label="Light theme"
              />
              <IconBtn
                icon={Moon}
                c={c}
                onClick={() => setTheme("dark")}
                label="Dark theme"
              />
            </div>
          }
        />
        <div style={{ padding: "13px 4px", borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: fs, color: c.text }}>
              Text size
            </span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: fs - 3,
                color: c.accent,
              }}
            >
              {textSize}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {Object.keys(TEXT_SIZES).map((s) => (
              <button
                key={s}
                onClick={() => setTextSize(s)}
                style={chipStyle(c, fs, textSize === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 18 }} />
        <Eyebrow c={c}>Storage</Eyebrow>
        <Row
          c={c}
          fs={fs}
          label="Clear cache"
          sub={clearing ? "Clearing…" : `${cache.toFixed(1)} MB used`}
          right={
            <button
              onClick={clearCache}
              disabled={clearing || cache === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: `1px solid ${c.border}`,
                borderRadius: 8,
                padding: "7px 11px",
                color: c.danger,
                fontFamily: FONT_BODY,
                fontSize: fs - 3,
                cursor: cache === 0 ? "default" : "pointer",
                opacity: cache === 0 ? 0.4 : 1,
              }}
            >
              <Trash size={12} /> Clear
            </button>
          }
        />

        <div style={{ height: 18 }} />
        <Eyebrow c={c}>About</Eyebrow>
        <Row c={c} fs={fs} label="App information" right={<Info size={15} color={c.textFaint} />} onClick={() => {}} />
        <Row c={c} fs={fs} label="Version" right={<span style={{ fontFamily: FONT_DISPLAY, fontSize: fs - 3, color: c.textFaint }}>2.0.0</span>} />
        <Row c={c} fs={fs} label="App permissions" right={<Shield size={15} color={c.textFaint} />} onClick={() => {}} />
        <Row c={c} fs={fs} label="Terms of Service & Privacy Policy" right={<span style={{ color: c.textFaint }}>→</span>} onClick={() => {}} />
        <Row c={c} fs={fs} label="Send feedback / report a bug" right={<MessageSquare size={15} color={c.textFaint} />} onClick={() => {}} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
export default function GameEngineApp() {
  const [screen, setScreen] = useState("home");
  const [themeName, setThemeName] = useState("dark");
  const [textSize, setTextSize] = useState("Standard");
  const [projects, setProjects] = useState(seedProjects);
  const [openProject, setOpenProject] = useState(null);
  const [tilemaps, setTilemaps] = useState({});
  const [menus, setMenus] = useState({});

  const c = THEMES[themeName];
  const fs = TEXT_SIZES[textSize];

  const setTilemapForProject = (projectId, nextData) =>
    setTilemaps((prev) => ({ ...prev, [projectId]: nextData }));
  const setMenuForProject = (projectId, nextData) =>
    setMenus((prev) => ({ ...prev, [projectId]: nextData }));

  const handleCreate = ({ name, type, canvasSize, gridSnap }) => {
    const proj = {
      id: uid(),
      name: name || "Untitled Project",
      type,
      canvasSize,
      gridSnap,
      tiles: 0,
      updated: "just now",
    };
    setProjects((ps) => [proj, ...ps]);
    setOpenProject(proj);
    setScreen("editor");
  };

  const openExisting = (p) => {
    setOpenProject(p);
    setScreen("editor");
  };

  let body;
  if (screen === "home") {
    body = (
      <HomeScreen
        c={c}
        fs={fs}
        setScreen={setScreen}
        projectCount={projects.length}
      />
    );
  } else if (screen === "projects") {
    body = (
      <ProjectsScreen
        c={c}
        fs={fs}
        projects={projects}
        setProjects={setProjects}
        onOpen={openExisting}
      />
    );
  } else if (screen === "create") {
    body = <CreateProjectScreen c={c} fs={fs} onCreate={handleCreate} />;
  } else if (screen === "settings") {
    body = (
      <SettingsScreen
        c={c}
        fs={fs}
        theme={themeName}
        setTheme={setThemeName}
        textSize={textSize}
        setTextSize={setTextSize}
      />
    );
  } else if (screen === "editor" && openProject) {
    body = (
      <EditorScreen
        c={c}
        fs={fs}
        project={openProject}
        onBack={() => setScreen("projects")}
        tilemapData={tilemaps[openProject.id] || makeDefaultTilemap()}
        onTilemapChange={(next) => setTilemapForProject(openProject.id, next)}
        menuData={menus[openProject.id] || makeDefaultMenu()}
        onMenuChange={(next) => setMenuForProject(openProject.id, next)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: themeName === "dark" ? "#0A0E17" : "#DAD4C0",
        fontFamily: FONT_BODY,
        padding: "28px 12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 360,
          height: 720,
          background: c.bg,
          borderRadius: 34,
          border: `8px solid ${themeName === "dark" ? "#05070C" : "#1D2536"}`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {body}
        </div>
        {screen !== "editor" && (
          <BottomNav screen={screen} setScreen={setScreen} c={c} fs={fs} />
        )}
      </div>
    </div>
  );
}
