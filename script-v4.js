const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const compressBtn = document.getElementById("compressBtn");
const targetKBInput = document.getElementById("targetKB");
const preview = document.getElementById("preview");
const mainText = document.getElementById("mainText");

let selectedFile = null;

selectBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  selectedFile = fileInput.files[0];
  mainText.textContent = selectedFile ? selectedFile.name : "Select image to compress";
};

function bytesToKB(bytes) {
  return (bytes / 1024).toFixed(1);
}

async function compressToTarget(file, targetKB) {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxW = 1200;
  const scale = Math.min(1, maxW / img.width);
  canvas.width = Math.floor(img.width * scale);
  canvas.height = Math.floor(img.height * scale);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.9;
  let blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", quality));

  let tries = 0;
  while (blob.size / 1024 > targetKB && quality > 0.05 && tries < 20) {
    quality -= 0.05;
    blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", quality));
    tries++;
  }

  return blob;
}

compressBtn.onclick = async () => {
  if (!selectedFile) {
    alert("Select image first");
    return;
  }

  const targetKB = parseInt(targetKBInput.value, 10);
  if (!targetKB || targetKB < 20 || targetKB > 500) {
    alert("Target size must be between 20KB and 500KB");
    return;
  }

  preview.innerHTML = `
    <p style="color:#64748b">⏳ Compressing… please wait</p>
  `;

  const beforeKB = bytesToKB(selectedFile.size);
  const blob = await compressToTarget(selectedFile, targetKB);
  const afterKB = bytesToKB(blob.size);
  const url = URL.createObjectURL(blob);

  preview.innerHTML = `
    <p>Before: <strong>${beforeKB} KB</strong> → After: <strong>${afterKB} KB</strong></p>
    <img src="${url}" alt="Compressed preview">
    <br><br>
    <a href="${url}" download="compressed.jpg">
      <button>Download Image</button>
    </a>
  `;
};
