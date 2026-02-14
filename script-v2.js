const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const qualityInput = document.getElementById("quality");
const qVal = document.getElementById("qVal");
const preview = document.getElementById("preview");

selectBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent any parent click
  fileInput.value = ""; // reset so same image can be selected again
  fileInput.click();
});

uploadBox.addEventListener("click", () => {
  fileInput.value = "";
  fileInput.click();
});

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) compressImage(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) compressImage(file);
});

qualityInput.addEventListener("input", () => {
  qVal.textContent = qualityInput.value;
});

function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const maxWidth = 1200;
      const scale = Math.min(1, maxWidth / img.width);

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const quality = Number(qualityInput.value) / 100;
      const compressed = canvas.toDataURL("image/jpeg", quality);

      preview.innerHTML = `
        <img src="${compressed}" alt="Compressed Preview">
        <div>
          <a href="${compressed}" download="compressed.jpg">
            <button>Download Compressed Image</button>
          </a>
        </div>
      `;
    };

    img.onerror = () => {
      alert("Image could not be loaded. Try another file.");
    };
  };

  reader.onerror = () => {
    alert("File reading failed. Try again.");
  };
  }
