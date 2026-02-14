// Robust image compressor to hit target KB
async function compressToTarget(file, targetKB, maxW = 600, maxH = 600) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let w = img.width, h = img.height;
  const ratio = Math.min(maxW / w, maxH / h, 1);
  w = Math.round(w * ratio); h = Math.round(h * ratio);
  canvas.width = w; canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  let q = 0.92, blob = await toBlob(canvas, q);
  let loops = 0;

  while (blob.size / 1024 > targetKB && loops < 25) {
    q -= 0.06;
    if (q < 0.2) {
      canvas.width = Math.round(canvas.width * 0.9);
      canvas.height = Math.round(canvas.height * 0.9);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      q = 0.85;
    }
    blob = await toBlob(canvas, q);
    loops++;
  }
  return blob;
}

function toBlob(canvas, q) {
  return new Promise(res => canvas.toBlob(b => res(b), "image/jpeg", q));
}
function loadImage(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// Drag & drop
function bindDrop(zone, input) {
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", e => {
    e.preventDefault(); zone.classList.remove("dragover");
    if (e.dataTransfer.files[0]) input.files = e.dataTransfer.files;
  });
}
