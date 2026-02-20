function compressImage(){
  const fileInput = document.getElementById("fileInput");
  const targetKB = document.getElementById("targetKB").value;
  const preview = document.getElementById("preview");
  const downloadLink = document.getElementById("downloadLink");

  if(!fileInput.files[0] || !targetKB){
    alert("Select image and target KB");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img,0,0);

      let quality = 0.9;
      let blob;

      function tryCompress(){
        canvas.toBlob(b=>{
          blob = b;
          if(blob.size/1024 <= targetKB || quality <= 0.1){
            const url = URL.createObjectURL(blob);
            preview.src = url;
            downloadLink.href = url;
            downloadLink.download = "compressed.jpg";
            downloadLink.style.display = "block";
            downloadLink.innerText = `Download (${Math.round(blob.size/1024)} KB)`;
          } else {
            quality -= 0.05;
            tryCompress();
          }
        }, "image/jpeg", quality);
      }

      tryCompress();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}
