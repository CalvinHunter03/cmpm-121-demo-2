import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");

canvas.width = 256;
canvas.height = 256;

app.append(canvas);

const ctx = canvas.getContext("2d");

ctx.fillStyle = "skyblue";
ctx.fillRect(0, 0, 256, 256);
