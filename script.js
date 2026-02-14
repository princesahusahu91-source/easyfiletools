<script>
const fileInput = document.getElementById("imageInput");
const sizeInput = document.getElementById("sizeInput");
const qualityInput = document.getElementById("qualityInput");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");
const statusText = document.getElementById("statusText");

let originalImage = null;

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      originalImage = img;
      preview.src = img.src;
      statusText.innerText = "Image loaded. Now compress it 👇";
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function compressImage() {
  if (!originalImage) {
    alert("Please upload an image first");
    return;
  }

  const targetKB = parseInt(sizeInput.value);
  let quality = parseFloat(qualityInput.value);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = originalImage.width;
  canvas.height = originalImage.height;
  ctx.drawImage(originalImage, 0, 0);

  let compressedData = canvas.toDataURL("image/jpeg", quality);

  let currentSizeKB = Math.round((compressedData.length * 3) / 4 / 1024);

  while (currentSizeKB > targetKB && quality > 0.1) {
    quality -= 0.05;
    compressedData = canvas.toDataURL("image/jpeg", quality);
    currentSizeKB = Math.round((compressedData.length * 3) / 4 / 1024);
  }

  preview.src = compressedData;
  downloadBtn.href = compressedData;
  downloadBtn.download = "govt-exam-photo.jpg";
  statusText.innerText = `Done ✅ Final Size: ${currentSizeKB} KB`;
}
</script>
