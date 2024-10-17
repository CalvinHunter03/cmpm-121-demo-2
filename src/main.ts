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

app.append(clearButton, undoButton, redoButton);

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
const paths: Array<ReturnType<typeof createLine>> = [];
const redoStack: Array<ReturnType<typeof createLine>> = [];

function createLine(initialX: number, initialY: number) {
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
      ctx.lineWidth = 1;

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

//On mouse down inside canvas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentLine = createLine(e.offsetX, e.offsetY);
});

//on mouse move inside canvas
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || !currentLine) return;
  currentLine.drag(e.offsetX, e.offsetY); // add point to the current path
  dispatchDrawingChanged(); //dispatch event after adding a new point
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
  paths.forEach((path) => path.display(context));
}
