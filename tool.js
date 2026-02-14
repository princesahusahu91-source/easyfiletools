// tool.js – common logic for all image tools

let originalImage = null;

function initTool(dropId, inputId, previewId, statusId, downloadId) {
  const dropArea = document.getElementById(dropId);
  const fileInput = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const statusText = document.getElementById(statusId);
  const downloadBtn = document.getElementById(downloadId);

  if (!dropArea || !fileInput || !preview || !statusText || !downloadBtn) {
    console.error("Tool init failed: One or more elements not found");
    return;
  }

  // Click to open file picker
  dropArea.addEventListener("click", () => fileInput.click());

  // Drag over
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });

  // Drag leave
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  // Drop file
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    handleFile(file, preview, statusText);
  });

  // File input change
  fileInput.addEventListener("change", () => {
    handleFile(fileInput.files[0], preview, statusText);
  });

  // Expose compress function globally
  window.compressImage = function (targetKB) {
    if (!originalImage) {
      alert("Please upload an image first");
      return;
    }

    statusText.innerText = "Compressing... ⏳";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    let quality = 0.9;
    let output = canvas.toDataURL("image/jpeg", quality);
    let sizeKB = Math.round((output.length * 3) / 4 / 1024);

    while (sizeKB > targetKB && quality > 0.1) {
      quality -= 0.05;
      output = canvas.toDataURL("image/jpeg", quality);
      sizeKB = Math.round((output.length * 3) / 4 / 1024);
    }

    preview.src = output;
    downloadBtn.href = output;
    downloadBtn.download = "resized-image.jpg";

    statusText.innerText = `Done ✅ Final Size: ${sizeKB} KB`;
  };
}

function handleFile(file, preview, statusText) {
  if (!file || !file.type.startsWith("image")) {
    alert("Please upload a valid image file");
    return;
  }

  statusText.innerText = "Loading image...";

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      preview.src = img.src;
      statusText.innerText = "Image loaded. Choose size 👇";
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// Prevent browser from opening file on drop anywhere
["dragenter", "dragover", "dragleave", "drop"].forEach(evt => {
  document.addEventListener(evt, (e) => e.preventDefault());
});
