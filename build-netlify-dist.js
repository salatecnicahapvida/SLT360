const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");

const files = [
  "index.html",
  "app.js",
  "styles.css",
  "sic-approval-dashboard.html",
];

const directories = [
  "assets",
  "data",
];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);
  fs.cpSync(source, target, { recursive: true });
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

files.forEach(copyFile);
directories.forEach(copyDirectory);

console.log(`Netlify dist criada em ${dist}`);
