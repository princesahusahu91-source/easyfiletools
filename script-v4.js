const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const compressBtn = document.getElementById("compressBtn");
const targetKBInput = document.getElementById("targetKB");
const preview = document.getElementById("preview");

let selectedFile = null;
let originalDataURL = null;

selectBtn.onclick = e => {
  e.stopPropagation();
  fileInput.value = "";
  fileInput.click();
};

uploadBox.onclick = () => {
  fileInput.value = "";
  fileInput.click();
};

uploadBox.ondragover = e => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
};
uploadBox.ondragleave = () => uploadBox.classList.remove("dragover");
uploadBox.ondrop = e => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
};

fileInput.onchange = () => {
  if (fileInput.files[0]) loadFile(fileInput.files[0]);
};

function loadFile(file) {
  if (!file.type.startsWith("image/")) return alert("Select an image file.");
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = () => {
    originalDataURL = reader.result;
    renderPreview(null); // show original only
  };
  reader.readAsDataURL(file);
}

compressBtn.onclick = () => {
  if (!selectedFile) return alert("Select an image first.");
  let targetKB = Number(targetKBInput.value);
  if (targetKB < 20 || targetKB > 500) return alert("Target must be 20–500 KB.");
  compressToTarget(selectedFile, targetKB);
};

function compressToTarget(file, targetKB) {
  const img = new Image();
  img.src = originalDataURL;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxW = 1200;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let q = 0.9;
    let out = canvas.toDataURL("image/jpeg", q);
    let sizeKB = getKB(out);

    // binary-ish search for quality
    let low = 0.1, high = 0.95;
    for (let i = 0; i < 12; i++) {
      q = (low + high) / 2;
      out = canvas.toDataURL("image/jpeg", q);
      sizeKB = getKB(out);
      if (sizeKB > targetKB) high = q;
      else low = q;
    }

    renderPreview(out, sizeKB);
  };
}

function getKB(dataURL) {
  return Math.round((dataURL.length * 3) / 4 / 1024);
}

function renderPreview(compressedDataURL, compressedKB) {
  const originalKB = selectedFile ? Math.round(selectedFile.size / 1024) : 0;

  preview.innerHTML = `
    <div class="card">
      <h3>Original</h3>
      <img src="${originalDataURL}">
      <div class="meta">Size: ${originalKB} KB</div>
    </div>
    ${compressedDataURL ? `
    <div class="card">
      <h3>Compressed</h3>
      <img src="${compressedDataURL}">
      <div class="meta">Size: <span class="red">${compressedKB} KB</span></div>
      <div style="text-align:center; margin-top:6px;">
        <a href="${compressedDataURL}" download="compressed.jpg">
          <button>Download</button>
        </a>
      </div>
    </div>` : ``}
  `;
  }
  
