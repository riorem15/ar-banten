const { promisify } = require('util');
const fs = require('fs');
const convert = require('heic-convert');

(async () => {
  const inputBuffer = fs.readFileSync('C:/Antigravity/Web/PROJECT VR/New Publick/Menara Air Pandeglang/Keseluruhan Menara Air Pandeglang.HEIC');
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG',      // output format
    quality: 1           // the jpeg compression quality, between 0 and 1
  });

  fs.writeFileSync('C:/Antigravity/Web/PROJECT VR/New Publick/Menara Air Pandeglang/Keseluruhan Menara Air Pandeglang.jpg', outputBuffer);
  console.log('Conversion successful!');
})();
