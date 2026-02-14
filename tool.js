async function compressToTarget(file, targetKB, maxW=600, maxH=600){
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let w = img.width, h = img.height;
  const r = Math.min(maxW/w, maxH/h, 1);
  w = Math.round(w*r); h = Math.round(h*r);
  canvas.width = w; canvas.height = h;
  ctx.drawImage(img,0,0,w,h);

  let q = 0.92, blob = await toBlob(canvas,q), i=0;
  while(blob.size/1024 > targetKB && i < 30){
    q -= 0.06;
    if(q < 0.2){
      canvas.width = Math.round(canvas.width*0.9);
      canvas.height = Math.round(canvas.height*0.9);
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      q = 0.85;
    }
    blob = await toBlob(canvas,q);
    i++;
  }
  return blob;
}

function toBlob(c,q){return new Promise(r=>c.toBlob(b=>r(b),"image/jpeg",q))}
function loadImage(f){return new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=URL.createObjectURL(f)})}

function bindDrop(zone,input){
  zone.addEventListener("dragover",e=>{e.preventDefault();zone.classList.add("dragover")});
  zone.addEventListener("dragleave",()=>zone.classList.remove("dragover"));
  zone.addEventListener("drop",e=>{
    e.preventDefault();zone.classList.remove("dragover");
    if(e.dataTransfer.files[0]) input.files = e.dataTransfer.files;
  });
}
