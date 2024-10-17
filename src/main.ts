import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

//All buttons; Clear button, undo button, redo button
const clearButton = createButton("Clear");
const undoButton = createButton("Undo");
const redoButton = createButton("Redo");
const thinButton = createButton("Thin");
const thickButton = createButton("Thick");

app.append(clearButton, undoButton, redoButton, thinButton, thickButton);

//spacing
app.append(document.createElement("div"));

//Canvas!
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

//Get context
const context = canvas.getContext("2d");
//make it blue and such
context!.fillStyle = "skyblue";
context!.fillRect(0, 0, canvas.width, canvas.height);

//Drawing vars
let isDrawing = false;
let currentLine: ReturnType<typeof createLine> | null = null;
let toolPreview: ReturnType<typeof createToolPreview> | null = null;
const paths: Array<ReturnType<typeof createLine>> = [];
const redoStack: Array<ReturnType<typeof createLine>> = [];

let markerThickness = 1;

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
      ctx.strokeStyle = "black";
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

//create too preview
function createToolPreview(x: number, y: number, thickness: number) {
  return {
    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(x, y, thickness / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    },
  };
}

//On mouse down inside canvas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentLine = createLine(e.offsetX, e.offsetY, markerThickness);
});

//on mouse move inside canvas
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing && currentLine) {
    currentLine.drag(e.offsetX, e.offsetY);
    dispatchDrawingChanged();
  } else {
    toolPreview = createToolPreview(e.offsetX, e.offsetY, markerThickness);
    dispatchToolMoved();
  }
});

//on mouse up on on canvas
window.addEventListener("mouseup", () => {
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
  markerThickness = 1;
  updateSelectedTool(thinButton);
});

//thick button functinlaity
thickButton.addEventListener("click", () => {
  markerThickness = 3;
  updateSelectedTool(thickButton);
});

//function to udpateSelectedTool
function updateSelectedTool(selectedButton: HTMLButtonElement) {
  [thinButton, thickButton].forEach((button) =>
    button.classList.remove("selectedTool")
  );
  selectedButton.classList.add("selectedTool");
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

//function dispatch the tool-moved event
function dispatchToolMoved() {
  const event = new CustomEvent("tool-moved");
  canvas.dispatchEvent(event);
}

//Observer for drawing changed event.
canvas.addEventListener("drawing-changed", () => {
  context!.clearRect(0, 0, canvas.width, canvas.height);
  context!.fillStyle = "skyblue";
  context!.fillRect(0, 0, canvas.width, canvas.height);
  redrawPaths();
});

canvas.addEventListener("tool-moved", () => {
  if (!isDrawing && toolPreview) {
    redrawPaths();
    toolPreview.draw(context);
  }
});

function redrawPaths() {
  paths.forEach((path) => path.display(context));
}
