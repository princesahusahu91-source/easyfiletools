const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const compressBtn = document.getElementById("compressBtn");
const targetKB = document.getElementById("targetKB");
const preview = document.getElementById("preview");

let selectedFile = null;

selectBtn.onclick = () => fileInput.click();

uploadBox.ondragover = e => {
  e.preventDefault();
  uploadBox.classList.add("drag");
};
uploadBox.ondragleave = () => uploadBox.classList.remove("drag");
uploadBox.ondrop = e => {
  e.preventDefault();
  uploadBox.classList.remove("drag");
  handleFile(e.dataTransfer.files[0]);
};

fileInput.onchange = () => handleFile(fileInput.files[0]);

function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return alert("Select image only");
  selectedFile = file;
  document.getElementById("mainText").innerText = file.name;
}

compressBtn.onclick = async () => {
  if (!selectedFile) return alert("Select image first");

  const targetBytes = targetKB.value * 1024;
  const img = new Image();
  img.src = URL.createObjectURL(selectedFile);

  img.onload = async () => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let quality = 0.9;
    let blob;

    for (let i = 0; i < 10; i++) {
      blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", quality));
      if (blob.size <= targetBytes) break;
      quality -= 0.08;
    }

    const url = URL.createObjectURL(blob);
    preview.innerHTML = `
      <p>Final size: ${(blob.size/1024).toFixed(2)} KB</p>
      <img src="${url}">
      <br><br>
      <a href="${url}" download="compressed.jpg">
        <button>Download</button>
      </a>
    `;
  };
};
