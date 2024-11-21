import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const CANVAS_HEIGHT = 256;
const CANVAS_WIDTH = 256;

//All buttons; Clear button, undo button, redo button
const clearButton = createButton("Clear");
const undoButton = createButton("Undo");
const redoButton = createButton("Redo");
const thinButton = createButton("Thin");
const thickButton = createButton("Thick");
const customStickerButton = createButton("Custom Sticker");

app.append(
  clearButton,
  undoButton,
  redoButton,
  thinButton,
  thickButton,
  customStickerButton
);

const stickers: Array<{ emoji: string }> = [
  { emoji: "🐵" },
  { emoji: "🍌" },
  { emoji: "🦅" },
];

let currentColor = "black";
let currentRotation = 0;

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomRotation() {
  return Math.floor(Math.random() * 360);
}

function renderStickers() {
  stickers.forEach(({ emoji }) => {
    const stickerButton = createButton(emoji);
    stickerButton.addEventListener("click", () => {
      selectSticker(emoji);
    });
    app.append(stickerButton);
  });
}

renderStickers();

//spacing
app.append(document.createElement("div"));

//Canvas!
const canvas = document.createElement("canvas");
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
app.append(canvas);

//Get context
const context = canvas.getContext("2d");
//make it blue and such
context!.fillStyle = "skyblue";
context!.fillRect(0, 0, canvas.width, canvas.height);

//Drawing vars
let isDrawing = false;
let currentLine: ReturnType<typeof createLine> | null = null;
//let toolPreview: ReturnType<typeof createToolPreview> | null = null;
const paths: Array<ReturnType<typeof createLine>> = [];
const redoStack: Array<ReturnType<typeof createLine>> = [];

let markerThickness = 1;
let selectedSticker: string | null = null;

function createLine(initialX: number, initialY: number, thickness: number) {
  const points: Array<{ x: number; y: number }> = [
    { x: initialX, y: initialY },
  ];

  return {
    drag(x: number, y: number) {
      points.push({ x, y });
    },

    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = thickness;

      for (let i = 0; i < points.length - 1; i++) {
        const { x: x1, y: y1 } = points[i];
        const { x: x2, y: y2 } = points[i + 1];
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }

      ctx.stroke();
      ctx.closePath();
    },
  };
}

// draw cursor circle
function drawCursorCircle(x: number, y: number, thickness: number) {
  if (context === null) {
    return;
  }
  context.beginPath();
  context.arc(x, y, thickness / 2, 0, Math.PI * 2);
  context.strokeStyle = currentColor;
  context.lineWidth = 1;
  context.stroke();
  context.closePath();
}

//draw sticker preview
function drawStickerPreview(x: number, y: number, sticker: string) {
  if (context === null) return;
  context.save();
  context.translate(x, y);
  context.rotate((currentRotation * Math.PI) / 180);
  context.font = "24px sans-serif";
  context.fillText(sticker, x - 12, y + 12);
  context.restore();
}

//plcae sticker
function placeSticker(x: number, y: number, sticker: string) {
  paths.push({
    drag: () => {},
    display(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((currentRotation * Math.PI) / 180);
      ctx.font = "24px sans-serif";
      ctx.fillText(sticker, x - 12, y + 12);
      ctx.restore();
    },
  });
  dispatchDrawingChanged();
}

//select sticker
function selectSticker(sticker: string) {
  selectedSticker = sticker;
  randomizeTool();
}

//function to udpateSelectedTool
function updateSelectedTool(selectedButton: HTMLButtonElement) {
  [thinButton, thickButton].forEach((button) =>
    button.classList.remove("selectedTool")
  );
  selectedButton.classList.add("selectedTool");
  selectedSticker = null;
  randomizeTool();
}

function randomizeTool() {
  currentColor = getRandomColor();
  currentRotation = getRandomRotation();
}

//function to create buttons
function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerHTML = label;
  return button;
}

//drawing changes function
function dispatchDrawingChanged() {
  const event = new CustomEvent("drawing-changed");
  canvas.dispatchEvent(event);
}

//Observer for drawing changed event.
canvas.addEventListener("drawing-changed", () => {
  context!.clearRect(0, 0, canvas.width, canvas.height);
  context!.fillStyle = "skyblue";
  context!.fillRect(0, 0, canvas.width, canvas.height);
  redrawPaths();
});

function redrawPaths() {
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "skyblue";
  context.fillRect(0, 0, canvas.width, canvas.height);
  paths.forEach((path) => path.display(context));
}

app.append(document.createElement("div"));

const exportButton = createButton("Export");
app.append(exportButton);

//On mouse down inside canvas
canvas.addEventListener("mousedown", (e) => {
  if (selectedSticker) {
    placeSticker(e.offsetX, e.offsetY, selectedSticker);
  } else {
    isDrawing = true;
    currentLine = createLine(e.offsetX, e.offsetY, markerThickness);
  }
});

//on mouse move inside canvas
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
  
    // Clear and redraw paths to include the currently drawn line in real time
    context!.clearRect(0, 0, canvas.width, canvas.height);
    context!.fillStyle = "skyblue";
    context!.fillRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => path.display(context!));
    currentLine.display(context!); // Display the line being drawn
  } else {
    redrawPaths();
    if (selectedSticker) {
      drawStickerPreview(e.offsetX, e.offsetY, selectedSticker);
    } else {
      drawCursorCircle(e.offsetX, e.offsetY, markerThickness);
    }
  }
});

//on mouse up on on canvas
globalThis.addEventListener("mouseup", () => {
  if (!isDrawing || !currentLine) return;
  isDrawing = false;
  paths.push(currentLine);
  currentLine = null;
  redoStack.length = 0;
  dispatchDrawingChanged();
});

//clear button functionality
clearButton.addEventListener("click", () => {
  paths.length = 0;
  redoStack.length = 0;
  dispatchDrawingChanged();
});

//undo Button functionality
undoButton.addEventListener("click", () => {
  if (paths.length === 0) return;
  const lastPath = paths.pop();
  redoStack.push(lastPath!);
  dispatchDrawingChanged();
});

//redo button functionality
redoButton.addEventListener("click", () => {
  if (redoStack.length === 0) return;
  const restoredPath = redoStack.pop();
  paths.push(restoredPath!);
  dispatchDrawingChanged();
});

//thinButton functionality
thinButton.addEventListener("click", () => {
  markerThickness = 5;
  updateSelectedTool(thinButton);
});

//thick button functinlaity
thickButton.addEventListener("click", () => {
  markerThickness = 9;
  updateSelectedTool(thickButton);
});

//custom sticker button functionality
customStickerButton.addEventListener("click", () => {
  const userSticker = prompt("Enter a custom sticker", "🧢");
  if (userSticker) {
    stickers.push({ emoji: userSticker });
    const stickerButton = createButton(userSticker);
    stickerButton.addEventListener("click", () => selectSticker(userSticker));
    app.append(stickerButton);
  }
});

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d");

  exportContext?.scale(4, 4);

  paths.forEach((path) => path.display(exportContext!));

  const imageDataURL = exportCanvas.toDataURL("image/png");
  const downloadLink = document.createElement("a");
  downloadLink.href = imageDataURL;
  downloadLink.download = "sticker-sketchpad.png";
  downloadLink.click();
});
