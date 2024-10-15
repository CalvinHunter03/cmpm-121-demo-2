import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

//Clear button
const clearButtonName = "Clear";
const clearButton = document.createElement("button");
clearButton.innerHTML = clearButtonName;
app.append(clearButton);

//spacing
app.append(document.createElement("div"));

//Canvas!
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

//Get context
const context = canvas.getContext("2d");

console.log(typeof context);

//make it blue and such
context!.fillStyle = "skyblue";
context!.fillRect(0, 0, 256, 256);

//Drawing vars
let isDrawing = false;
let currentPath: Array<{ x: number; y: number }> = [];
const paths: Array<Array<{ x: number; y: number }>> = [];

//On mouse down inside canvas
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  currentPath = [{ x: e.offsetX, y: e.offsetY }];
});

//on mouse move inside canvas
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  currentPath.push({ x: e.offsetX, y: e.offsetY }); // add point to the current path
  dispatchDrawingChanged(); //dispatch event after adding a new point
});

//on mouse up on on canvas
window.addEventListener("mouseup", (e) => {
  if (!isDrawing) return;
  isDrawing = false;
  paths.push(currentPath);
  currentPath = [];
  dispatchDrawingChanged();
});

clearButton.addEventListener("click", () => {
  paths.length = 0;
  dispatchDrawingChanged();
});

function dispatchDrawingChanged() {
  const event = new CustomEvent("drawing-changed");
  canvas.dispatchEvent(event);
}

canvas.addEventListener("drawing-changed", () => {
  context!.clearRect(0, 0, canvas.width, canvas.height);
  context!.fillStyle = "skyblue";
  context!.fillRect(0, 0, canvas.width, canvas.height);
  redrawPaths();
});

function redrawPaths() {
  context!.strokeStyle = "black";
  context!.lineWidth = 1;

  paths.forEach((path) => {
    context!.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const { x: x1, y: y1 } = path[i];
      const { x: x2, y: y2 } = path[i + 1];
      context!.moveTo(x1, y1);
      context!.lineTo(x2, y2);
    }
    context!.stroke();
    context!.closePath();
  });
}

//funciton to draw line, idk what type context is..
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  context.beginPath();
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
