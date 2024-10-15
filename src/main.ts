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
let x = 0;
let y = 0;

//On mouse down inside canvas
canvas.addEventListener("mousedown", (e) => {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
});

//on mouse move inside canvas
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    drawLine(context!, x, y, e.offsetX, e.offsetY);
    x = e.offsetX;
    y = e.offsetY;
  }
});

//on mouse up on on canvas
window.addEventListener("mouseup", (e) => {
  if (isDrawing) {
    drawLine(context!, x, y, e.offsetX, e.offsetY);
    x = 0;
    y = 0;
    isDrawing = false;
  }
});

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

clearButton.addEventListener("click", () => {
  context!.clearRect(0, 0, canvas.width, canvas.height);
  context!.fillStyle = "skyblue";
  context!.fillRect(0, 0, 256, 256);
});
