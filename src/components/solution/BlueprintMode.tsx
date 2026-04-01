import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import {
  Square, Circle, ArrowRight, Type, MousePointer, Trash2,
  ZoomIn, ZoomOut, Diamond, Minus, Undo2, Redo2, Pencil, Eraser,
  Triangle, StickyNote, ChevronDown, Download, Save, Grid3X3,
  Maximize, ArrowUpRight, CornerDownRight,
} from 'lucide-react';

type ShapeType = 'rect' | 'circle' | 'arrow' | 'text' | 'diamond' | 'line' | 'triangle' | 'roundrect' | 'parallelogram' | 'stickynote' | 'freehand';
type Tool = 'select' | 'rect' | 'circle' | 'arrow' | 'text' | 'delete' | 'diamond' | 'line' | 'triangle' | 'roundrect' | 'parallelogram' | 'stickynote' | 'freehand' | 'eraser' | 'connector';

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  x2?: number;
  y2?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  dashArray?: string;
}

export interface BlueprintData {
  shapes: Shape[];
  description: string;
}

const emptyBlueprint: BlueprintData = { shapes: [], description: '' };

const COLORS = [
  'hsl(175, 80%, 50%)', 'hsl(38, 92%, 60%)', 'hsl(210, 40%, 70%)',
  'hsl(260, 60%, 60%)', 'hsl(150, 60%, 45%)', 'hsl(0, 72%, 55%)',
  'hsl(222, 47%, 12%)', 'hsl(222, 47%, 20%)', 'hsl(210, 40%, 90%)',
  'transparent',
];

const DEFAULT_FILL = 'hsl(222, 47%, 12%)';
const DEFAULT_STROKE = 'hsl(210, 40%, 70%)';

interface Props {
  data: BlueprintData;
  onChange: (data: BlueprintData) => void;
}

interface HistoryEntry { shapes: Shape[]; }

export default function BlueprintMode({ data, onChange }: Props) {
  const [tool, setTool] = useState<Tool>('select');
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offX: number; offY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; handle: string; startX: number; startY: number; origShape: Shape } | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState('');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);
  const [strokeWidthSetting, setStrokeWidthSetting] = useState(2);
  const [currentFill, setCurrentFill] = useState(DEFAULT_FILL);
  const [currentStroke, setCurrentStroke] = useState(DEFAULT_STROKE);

  const [history, setHistory] = useState<HistoryEntry[]>([{ shapes: [] }]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pushHistory = useCallback((shapes: Shape[]) => {
    setHistory(prev => {
      const newHist = prev.slice(0, historyIdx + 1);
      newHist.push({ shapes: JSON.parse(JSON.stringify(shapes)) });
      return newHist;
    });
    setHistoryIdx(prev => prev + 1);
  }, [historyIdx]);

  const undo = () => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    onChange({ ...data, shapes: JSON.parse(JSON.stringify(history[newIdx].shapes)) });
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    onChange({ ...data, shapes: JSON.parse(JSON.stringify(history[newIdx].shapes)) });
  };

  const getPos = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom - panOffset.x,
      y: (e.clientY - rect.top) / zoom - panOffset.y,
    };
  }, [zoom, panOffset]);

  const updateShapes = (shapes: Shape[], record = true) => {
    onChange({ ...data, shapes });
    if (record) pushHistory(shapes);
  };

  const selectedShape = data.shapes.find(s => s.id === selected);

  const updateSelectedProp = (prop: string, value: string | number) => {
    if (!selected) return;
    const updated = data.shapes.map(s => s.id === selected ? { ...s, [prop]: value } : s);
    updateShapes(updated);
  };

  const getHandles = (s: Shape) => {
    if (s.type === 'arrow' || s.type === 'line' || s.type === 'freehand') return [];
    return [
      { id: 'nw', cx: s.x, cy: s.y },
      { id: 'ne', cx: s.x + s.w, cy: s.y },
      { id: 'sw', cx: s.x, cy: s.y + s.h },
      { id: 'se', cx: s.x + s.w, cy: s.y + s.h },
    ];
  };

  const hitTest = (pos: { x: number; y: number }, s: Shape) => {
    if (s.type === 'arrow' || s.type === 'line') {
      return Math.hypot(pos.x - s.x, pos.y - s.y) < 15 || Math.hypot(pos.x - (s.x2 || s.x), pos.y - (s.y2 || s.y)) < 15;
    }
    if (s.type === 'freehand' && s.points) {
      return s.points.some(p => Math.hypot(pos.x - p.x, pos.y - p.y) < 10);
    }
    return pos.x >= s.x && pos.x <= s.x + s.w && pos.y >= s.y && pos.y <= s.y + s.h;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);

    if (tool === 'freehand') {
      setDrawing(true);
      setFreehandPoints([pos]);
      return;
    }

    if (tool === 'eraser') {
      const clicked = [...data.shapes].reverse().find(s => hitTest(pos, s));
      if (clicked) updateShapes(data.shapes.filter(s => s.id !== clicked.id));
      return;
    }

    if (tool === 'select') {
      const clicked = [...data.shapes].reverse().find(s => hitTest(pos, s));
      if (selected) {
        const sel = data.shapes.find(s => s.id === selected);
        if (sel) {
          for (const h of getHandles(sel)) {
            if (Math.hypot(pos.x - h.cx, pos.y - h.cy) < 8) {
              setResizing({ id: sel.id, handle: h.id, startX: pos.x, startY: pos.y, origShape: { ...sel } });
              return;
            }
          }
        }
      }
      if (clicked) {
        setSelected(clicked.id);
        setDragging({ id: clicked.id, offX: pos.x - clicked.x, offY: pos.y - clicked.y });
      } else {
        setSelected(null);
      }
      return;
    }

    if (tool === 'delete') {
      const clicked = [...data.shapes].reverse().find(s => hitTest(pos, s));
      if (clicked) updateShapes(data.shapes.filter(s => s.id !== clicked.id));
      return;
    }

    setDrawing(true);
    setDrawStart(pos);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getPos(e);

    if (tool === 'freehand' && drawing) {
      setFreehandPoints(prev => [...prev, pos]);
      return;
    }

    if (resizing) {
      const dx = pos.x - resizing.startX;
      const dy = pos.y - resizing.startY;
      const o = resizing.origShape;
      let { x, y, w, h } = o;
      if (resizing.handle.includes('e')) w = Math.max(30, o.w + dx);
      if (resizing.handle.includes('w')) { x = o.x + dx; w = Math.max(30, o.w - dx); }
      if (resizing.handle.includes('s')) h = Math.max(30, o.h + dy);
      if (resizing.handle.includes('n')) { y = o.y + dy; h = Math.max(30, o.h - dy); }
      onChange({ ...data, shapes: data.shapes.map(s => s.id === resizing.id ? { ...s, x, y, w, h } : s) });
      return;
    }

    if (dragging) {
      onChange({ ...data, shapes: data.shapes.map(s => s.id === dragging.id ? { ...s, x: pos.x - dragging.offX, y: pos.y - dragging.offY } : s) });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (tool === 'freehand' && drawing && freehandPoints.length > 1) {
      const xs = freehandPoints.map(p => p.x);
      const ys = freehandPoints.map(p => p.y);
      const shape: Shape = {
        id: crypto.randomUUID(), type: 'freehand',
        x: Math.min(...xs), y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys),
        fill: 'transparent', stroke: currentStroke, strokeWidth: strokeWidthSetting,
        points: [...freehandPoints],
      };
      updateShapes([...data.shapes, shape]);
      setFreehandPoints([]);
      setDrawing(false);
      return;
    }

    if (resizing) { pushHistory(data.shapes); setResizing(null); return; }
    if (dragging) { pushHistory(data.shapes); setDragging(null); return; }
    if (!drawing || !drawStart) return;
    const pos = getPos(e);
    const id = crypto.randomUUID();
    const minW = 80, minH = 50;

    const newShape = (type: ShapeType, extra: Partial<Shape> = {}): Shape => ({
      id, type,
      x: Math.min(drawStart.x, pos.x), y: Math.min(drawStart.y, pos.y),
      w: Math.max(Math.abs(pos.x - drawStart.x), minW),
      h: Math.max(Math.abs(pos.y - drawStart.y), minH),
      fill: currentFill, stroke: currentStroke, strokeWidth: strokeWidthSetting,
      ...extra,
    });

    let shapes = data.shapes;
    if (tool === 'rect') shapes = [...shapes, newShape('rect')];
    else if (tool === 'roundrect') shapes = [...shapes, newShape('roundrect')];
    else if (tool === 'circle') {
      const r = Math.max(Math.hypot(pos.x - drawStart.x, pos.y - drawStart.y), 30);
      shapes = [...shapes, newShape('circle', { x: drawStart.x - r, y: drawStart.y - r, w: r * 2, h: r * 2 })];
    } else if (tool === 'diamond') shapes = [...shapes, newShape('diamond')];
    else if (tool === 'triangle') shapes = [...shapes, newShape('triangle')];
    else if (tool === 'parallelogram') shapes = [...shapes, newShape('parallelogram')];
    else if (tool === 'stickynote') shapes = [...shapes, newShape('stickynote', { fill: 'hsl(38, 92%, 60%)', text: 'Note' })];
    else if (tool === 'arrow' || tool === 'connector') {
      shapes = [...shapes, { id, type: 'arrow' as ShapeType, x: drawStart.x, y: drawStart.y, w: 0, h: 0, x2: pos.x, y2: pos.y, fill: 'transparent', stroke: currentStroke, strokeWidth: strokeWidthSetting }];
    } else if (tool === 'line') {
      shapes = [...shapes, { id, type: 'line' as ShapeType, x: drawStart.x, y: drawStart.y, w: 0, h: 0, x2: pos.x, y2: pos.y, fill: 'transparent', stroke: currentStroke, strokeWidth: strokeWidthSetting }];
    } else if (tool === 'text') {
      const label = prompt('Enter text:');
      if (label) shapes = [...shapes, newShape('text', { x: drawStart.x, y: drawStart.y, w: Math.max(140, label.length * 9), h: 44, text: label })];
    }

    if (shapes !== data.shapes) updateShapes(shapes);
    setDrawing(false);
    setDrawStart(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const pos = getPos(e);
    const clicked = [...data.shapes].reverse().find(s => {
      if (s.type === 'arrow' || s.type === 'line' || s.type === 'freehand') return false;
      return pos.x >= s.x && pos.x <= s.x + s.w && pos.y >= s.y && pos.y <= s.y + s.h;
    });
    if (clicked) { setEditingText(clicked.id); setEditTextValue(clicked.text || ''); }
  };

  const commitTextEdit = () => {
    if (!editingText) return;
    updateShapes(data.shapes.map(s => s.id === editingText ? { ...s, text: editTextValue } : s));
    setEditingText(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('shape-type') as ShapeType;
    if (!type) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - panOffset.x;
    const y = (e.clientY - rect.top) / zoom - panOffset.y;
    const id = crypto.randomUUID();
    const size = type === 'text' ? { w: 140, h: 44 } : type === 'stickynote' ? { w: 120, h: 100 } : { w: 100, h: 70 };
    const shape: Shape = {
      id, type, x: x - size.w / 2, y: y - size.h / 2, ...size,
      fill: type === 'stickynote' ? 'hsl(38, 92%, 60%)' : currentFill,
      stroke: currentStroke, strokeWidth: strokeWidthSetting,
      text: type === 'text' ? 'Text' : type === 'stickynote' ? 'Note' : undefined,
    };
    updateShapes([...data.shapes, shape]);
    setTool('select');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !editingText) {
        updateShapes(data.shapes.filter(s => s.id !== selected));
        setSelected(null);
      }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, editingText, data.shapes, historyIdx, history]);

  const exportPNG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 1600; canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.download = 'blueprint.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.download = 'blueprint.json';
    a.href = URL.createObjectURL(blob);
    a.click();
  };

  const clearCanvas = () => { updateShapes([]); setSelected(null); };

  const renderShape = (s: Shape) => {
    const isSelected = selected === s.id;
    const strokeColor = isSelected ? 'hsl(175, 80%, 50%)' : s.stroke;
    const sw = isSelected ? s.strokeWidth + 1 : s.strokeWidth;
    const glow = isSelected ? { filter: 'drop-shadow(0 0 8px hsl(175 80% 50% / 0.6))' } : {};
    const textFill = 'hsl(210, 40%, 90%)';

    switch (s.type) {
      case 'rect':
        return (<g key={s.id} style={glow}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx={4} fill={s.fill} stroke={strokeColor} strokeWidth={sw} strokeDasharray={s.dashArray} />{s.text && <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 5} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text>}</g>);
      case 'roundrect':
        return (<g key={s.id} style={glow}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx={20} fill={s.fill} stroke={strokeColor} strokeWidth={sw} />{s.text && <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 5} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text>}</g>);
      case 'circle':
        return (<g key={s.id} style={glow}><ellipse cx={s.x + s.w / 2} cy={s.y + s.h / 2} rx={s.w / 2} ry={s.h / 2} fill={s.fill} stroke={strokeColor} strokeWidth={sw} />{s.text && <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 5} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text>}</g>);
      case 'diamond': {
        const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
        return (<g key={s.id} style={glow}><polygon points={`${cx},${s.y} ${s.x + s.w},${cy} ${cx},${s.y + s.h} ${s.x},${cy}`} fill={s.fill} stroke={strokeColor} strokeWidth={sw} />{s.text && <text x={cx} y={cy + 5} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text>}</g>);
      }
      case 'triangle': {
        const cx = s.x + s.w / 2;
        return (<g key={s.id} style={glow}><polygon points={`${cx},${s.y} ${s.x + s.w},${s.y + s.h} ${s.x},${s.y + s.h}`} fill={s.fill} stroke={strokeColor} strokeWidth={sw} />{s.text && <text x={cx} y={s.y + s.h * 0.65} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text>}</g>);
      }
      case 'parallelogram': {
        const off = s.w * 0.2;
        return (<g key={s.id} style={glow}><polygon points={`${s.x + off},${s.y} ${s.x + s.w},${s.y} ${s.x + s.w - off},${s.y + s.h} ${s.x},${s.y + s.h}`} fill={s.fill} stroke={strokeColor} strokeWidth={sw} />{s.text && <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 5} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text>}</g>);
      }
      case 'stickynote':
        return (<g key={s.id} style={glow}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx={2} fill={s.fill} stroke={strokeColor} strokeWidth={sw} opacity={0.9} />{s.text && <text x={s.x + 8} y={s.y + 20} fill="hsl(222, 47%, 12%)" fontSize="12" fontWeight="500">{s.text}</text>}</g>);
      case 'arrow':
        return (<line key={s.id} x1={s.x} y1={s.y} x2={s.x2 || s.x} y2={s.y2 || s.y} stroke={strokeColor} strokeWidth={sw} markerEnd="url(#arrowhead)" style={glow} />);
      case 'line':
        return (<line key={s.id} x1={s.x} y1={s.y} x2={s.x2 || s.x} y2={s.y2 || s.y} stroke={strokeColor} strokeWidth={sw} strokeDasharray={s.dashArray} style={glow} />);
      case 'text':
        return (<g key={s.id} style={glow}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx={4} fill={s.fill} stroke={strokeColor} strokeWidth={isSelected ? 2 : 1} /><text x={s.x + s.w / 2} y={s.y + s.h / 2 + 5} textAnchor="middle" fill={textFill} fontSize="13">{s.text}</text></g>);
      case 'freehand':
        if (!s.points || s.points.length < 2) return null;
        const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        return (<path key={s.id} d={d} fill="none" stroke={strokeColor} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={glow} />);
      default:
        return null;
    }
  };

  // Live freehand preview
  const renderFreehandPreview = () => {
    if (!drawing || tool !== 'freehand' || freehandPoints.length < 2) return null;
    const d = freehandPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return <path d={d} fill="none" stroke={currentStroke} strokeWidth={strokeWidthSetting} strokeLinecap="round" opacity={0.7} />;
  };

  const shapeLibrary = [
    { label: 'General', items: [
      { type: 'rect' as ShapeType, icon: Square, label: 'Rectangle' },
      { type: 'roundrect' as ShapeType, icon: Square, label: 'Rounded Rect' },
      { type: 'circle' as ShapeType, icon: Circle, label: 'Circle' },
      { type: 'diamond' as ShapeType, icon: Diamond, label: 'Diamond' },
      { type: 'triangle' as ShapeType, icon: Triangle, label: 'Triangle' },
      { type: 'parallelogram' as ShapeType, icon: Square, label: 'Parallelogram' },
    ]},
    { label: 'Flowchart', items: [
      { type: 'roundrect' as ShapeType, icon: Square, label: 'Start/End' },
      { type: 'rect' as ShapeType, icon: Square, label: 'Process' },
      { type: 'diamond' as ShapeType, icon: Diamond, label: 'Decision' },
      { type: 'parallelogram' as ShapeType, icon: Square, label: 'Input/Output' },
    ]},
    { label: 'Connectors', items: [
      { type: 'arrow' as ShapeType, icon: ArrowRight, label: 'Arrow' },
      { type: 'line' as ShapeType, icon: Minus, label: 'Line' },
    ]},
    { label: 'Other', items: [
      { type: 'text' as ShapeType, icon: Type, label: 'Text' },
      { type: 'stickynote' as ShapeType, icon: StickyNote, label: 'Sticky Note' },
    ]},
  ];

  const mainTools: { tool: Tool; icon: any; label: string; title?: string }[] = [
    { tool: 'select', icon: MousePointer, label: 'Select', title: 'Select & Move (V)' },
    { tool: 'freehand', icon: Pencil, label: 'Draw', title: 'Free-hand Draw' },
    { tool: 'rect', icon: Square, label: 'Rect' },
    { tool: 'circle', icon: Circle, label: 'Circle' },
    { tool: 'diamond', icon: Diamond, label: 'Diamond' },
    { tool: 'triangle', icon: Triangle, label: 'Triangle' },
    { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { tool: 'line', icon: Minus, label: 'Line' },
    { tool: 'connector', icon: CornerDownRight, label: 'Connect' },
    { tool: 'text', icon: Type, label: 'Text' },
    { tool: 'eraser', icon: Eraser, label: 'Eraser' },
    { tool: 'delete', icon: Trash2, label: 'Delete' },
  ];

  return (
    <div className="space-y-2">
      {/* Top menu bar */}
      <div className="glass-card px-2 py-1 flex items-center gap-0.5 text-xs">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs px-2">File</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={clearCanvas}>New</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportJSON}><Save className="h-3 w-3 mr-2" />Save as JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={exportPNG}><Download className="h-3 w-3 mr-2" />Export PNG</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs px-2">Edit</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={undo} disabled={historyIdx <= 0}>Undo (Ctrl+Z)</DropdownMenuItem>
            <DropdownMenuItem onClick={redo} disabled={historyIdx >= history.length - 1}>Redo (Ctrl+Y)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { if (selected) updateShapes(data.shapes.filter(s => s.id !== selected)); setSelected(null); }}>Delete Selected</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs px-2">View</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setShowGrid(!showGrid)}><Grid3X3 className="h-3 w-3 mr-2" />{showGrid ? 'Hide' : 'Show'} Grid</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(1)}>Reset Zoom</DropdownMenuItem>
            <DropdownMenuItem onClick={() => containerRef.current?.requestFullscreen?.()}><Maximize className="h-3 w-3 mr-2" />Fullscreen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 text-xs px-2">Extras</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={clearCanvas}>Clear Canvas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}>Reset View</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />
        <span className="text-muted-foreground">{data.shapes.length} elements</span>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-1.5 flex items-center gap-1 flex-wrap">
        {mainTools.map(t => (
          <Button key={t.tool} variant={tool === t.tool ? 'default' : 'ghost'} size="sm"
            onClick={() => setTool(t.tool)} title={t.title || t.label}
            className={`gap-1 h-7 px-2 text-[11px] ${tool === t.tool ? 'bg-primary text-primary-foreground' : ''}`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </Button>
        ))}

        <div className="h-5 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIdx <= 0}><Undo2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo2 className="h-3.5 w-3.5" /></Button>

        <div className="h-5 w-px bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}><ZoomOut className="h-3.5 w-3.5" /></Button>
        <span className="text-[11px] text-muted-foreground w-9 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(3, z + 0.1))}><ZoomIn className="h-3.5 w-3.5" /></Button>

        {/* Stroke width */}
        <div className="h-5 w-px bg-border mx-1" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Width:</span>
          {[1, 2, 3, 5].map(w => (
            <button key={w} onClick={() => setStrokeWidthSetting(w)}
              className={`h-6 w-6 rounded text-[10px] ${strokeWidthSetting === w ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
            >{w}</button>
          ))}
        </div>

        {/* Current colors */}
        <div className="h-5 w-px bg-border mx-1" />
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-6 w-6 rounded border border-border" style={{ backgroundColor: currentFill === 'transparent' ? undefined : currentFill }} title="Fill color" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2"><div className="grid grid-cols-5 gap-1">{COLORS.map(c => (
            <button key={c} onClick={() => { setCurrentFill(c); if (selected) updateSelectedProp('fill', c); }}
              className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: c === 'transparent' ? undefined : c }}>{c === 'transparent' ? '∅' : ''}</button>
          ))}</div></PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button className="h-6 w-6 rounded border-2" style={{ borderColor: currentStroke }} title="Stroke color" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2"><div className="grid grid-cols-5 gap-1">{COLORS.filter(c => c !== 'transparent').map(c => (
            <button key={c} onClick={() => { setCurrentStroke(c); if (selected) updateSelectedProp('stroke', c); }}
              className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: c }} />
          ))}</div></PopoverContent>
        </Popover>
      </div>

      {/* Main: Left panel + Canvas + Right panel */}
      <div className="flex gap-2" style={{ height: 520 }}>
        {/* Shapes library */}
        <div className="glass-card w-32 shrink-0 p-2 overflow-y-auto space-y-2">
          {shapeLibrary.map(group => (
            <div key={group.label}>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-1">{group.label}</p>
              {group.items.map((sp, i) => (
                <div key={`${sp.type}-${i}`} draggable
                  onDragStart={e => e.dataTransfer.setData('shape-type', sp.type)}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary/60 cursor-grab active:cursor-grabbing text-[11px] text-foreground/80 transition-colors"
                >
                  <sp.icon className="h-3.5 w-3.5 text-primary" /> {sp.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="glass-card flex-1 overflow-hidden relative" ref={containerRef}
          onDrop={handleCanvasDrop} onDragOver={e => e.preventDefault()}>
          {editingText && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card p-2 rounded-lg border border-border shadow-lg">
              <Input value={editTextValue} onChange={e => setEditTextValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitTextEdit(); }}
                className="h-8 w-48 text-sm" autoFocus />
              <Button size="sm" className="h-8" onClick={commitTextEdit}>OK</Button>
            </div>
          )}
          <svg ref={svgRef} width="100%" height="100%"
            className={`cursor-crosshair ${tool === 'freehand' ? 'cursor-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+),auto]' : ''}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', background: '#0f172a' }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick}
          >
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(222, 30%, 15%)" strokeWidth="0.5" />
              </pattern>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill="hsl(210, 40%, 70%)">
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            {showGrid && <rect width="5000" height="5000" fill="url(#grid)" x="-2500" y="-2500" />}
            <g transform={`translate(${panOffset.x},${panOffset.y})`}>
              {data.shapes.map(renderShape)}
              {renderFreehandPreview()}
              {selected && (() => {
                const s = data.shapes.find(sh => sh.id === selected);
                if (!s) return null;
                return getHandles(s).map(h => (
                  <rect key={h.id} x={h.cx - 5} y={h.cy - 5} width={10} height={10} rx={2}
                    fill="hsl(175, 80%, 50%)" stroke="hsl(222, 47%, 6%)" strokeWidth={1}
                    className="cursor-nwse-resize" style={{ filter: 'drop-shadow(0 0 4px hsl(175 80% 50% / 0.7))' }} />
                ));
              })()}
            </g>
          </svg>
        </div>

        {/* Right panel: style editor */}
        {selectedShape && (
          <div className="glass-card w-40 shrink-0 p-3 space-y-3 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Style</p>
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground">Fill</label>
              <div className="grid grid-cols-4 gap-1">{COLORS.map(c => (
                <button key={c} onClick={() => updateSelectedProp('fill', c)}
                  className={`h-5 w-5 rounded border ${selectedShape.fill === c ? 'ring-2 ring-primary' : 'border-border'}`}
                  style={{ backgroundColor: c === 'transparent' ? undefined : c }}>{c === 'transparent' ? <span className="text-[8px]">∅</span> : ''}</button>
              ))}</div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground">Stroke</label>
              <div className="grid grid-cols-4 gap-1">{COLORS.filter(c => c !== 'transparent').map(c => (
                <button key={c} onClick={() => updateSelectedProp('stroke', c)}
                  className={`h-5 w-5 rounded border ${selectedShape.stroke === c ? 'ring-2 ring-primary' : 'border-border'}`}
                  style={{ backgroundColor: c }} />
              ))}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Width</label>
              <div className="flex gap-1">{[1, 2, 3, 5].map(w => (
                <button key={w} onClick={() => updateSelectedProp('strokeWidth', w)}
                  className={`h-6 w-6 rounded text-[10px] ${selectedShape.strokeWidth === w ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{w}</button>
              ))}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">Line Style</label>
              <div className="flex gap-1">
                <button onClick={() => updateSelectedProp('dashArray', '')} className={`h-6 px-2 rounded text-[10px] ${!selectedShape.dashArray ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Solid</button>
                <button onClick={() => updateSelectedProp('dashArray', '6 3')} className={`h-6 px-2 rounded text-[10px] ${selectedShape.dashArray === '6 3' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>Dash</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="glass-card p-3 space-y-2">
        <label className="text-xs font-semibold text-foreground/80">Blueprint Description</label>
        <Textarea placeholder="Describe your visual blueprint — what does your diagram represent?"
          value={data.description} onChange={e => onChange({ ...data, description: e.target.value })}
          className="min-h-[70px] bg-background/50 border-border/50" />
      </div>
    </div>
  );
}

export { emptyBlueprint };
