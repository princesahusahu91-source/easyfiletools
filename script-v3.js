const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const qualityInput = document.getElementById("quality");
const qVal = document.getElementById("qVal");
const preview = document.getElementById("preview");
const tabs = document.querySelectorAll(".tab");
const mainText = document.getElementById("mainText");
const modeHint = document.getElementById("modeHint");

let mode = "passport"; // passport | signature | batch

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    mode = tab.dataset.mode;
    updateModeUI();
  });
});

function updateModeUI() {
  if (mode === "passport") {
    mainText.innerText = "Select photo for passport size";
    modeHint.innerText = "Target size: 20–50 KB (auto-adjusted)";
    fileInput.multiple = false;
  } else if (mode === "signature") {
    mainText.innerText = "Select signature image (white background)";
    modeHint.innerText = "Best for exam form signature upload";
    fileInput.multiple = false;
  } else {
    mainText.innerText = "Select multiple images to compress";
    modeHint.innerText = "All images will be compressed";
    fileInput.multiple = true;
  }
}

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
  handleFiles(e.dataTransfer.files);
};

fileInput.onchange = () => handleFiles(fileInput.files);

qualityInput.oninput = () => qVal.innerText = qualityInput.value;

function handleFiles(files) {
  preview.innerHTML = "";
  [...files].forEach(file => compressImage(file));
}

function compressImage(file) {
  if (!file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let scale = 1;
      if (mode !== "batch") scale = Math.min(1, 600 / img.width);

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let q = qualityInput.value / 100;
      let out = canvas.toDataURL("image/jpeg", q);

      if (mode === "passport") {
        let sizeKB = Math.round((out.length * 3) / 4 / 1024);
        while (sizeKB > 50 && q > 0.2) {
          q -= 0.05;
          out = canvas.toDataURL("image/jpeg", q);
          sizeKB = Math.round((out.length * 3) / 4 / 1024);
        }
      }

      const sizeKB = Math.round((out.length * 3) / 4 / 1024);

      preview.insertAdjacentHTML("beforeend", `
        <div class="card">
          <img src="${out}">
          <small>${sizeKB} KB</small>
          <a href="${out}" download="compressed.jpg">
            <button>Download</button>
          </a>
        </div>
      `);
    };
  };
}

updateModeUI();
