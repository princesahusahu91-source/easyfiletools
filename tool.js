<script>
let originalImage = null;
let currentPreview = null;

function initTool(dropId, inputId, previewId, statusId, downloadId) {
  const dropArea = document.getElementById(dropId);
  const fileInput = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const statusText = document.getElementById(statusId);
  const downloadBtn = document.getElementById(downloadId);

  dropArea.addEventListener("click", () => fileInput.click());

  dropArea.addEventListener("dragover", e => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  dropArea.addEventListener("drop", e => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    handleFile(e.dataTransfer.files[0], preview, statusText);
  });

  fileInput.addEventListener("change", () => {
    handleFile(fileInput.files[0], preview, statusText);
  });

  window.compressImage = function(targetKB) {
    if (!originalImage) {
      alert("Upload image first");
      return;
    }

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
    statusText.innerText = "Done ✅ Final Size: " + sizeKB + " KB";
  };
}

function handleFile(file, preview, statusText) {
  if (!file || !file.type.startsWith("image")) {
    alert("Please upload a valid image");
    return;
  }

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

// prevent browser opening dropped file
["dragenter","dragover","dragleave","drop"].forEach(evt => {
  document.body.addEventListener(evt, e => e.preventDefault());
});
</script>
    
