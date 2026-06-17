const { unpack } = require('msgpackr');
const fs = require('fs');

const data1 = fs.readFileSync('C:/Antigravity/Web/PROJECT VR/New Publick/Bale Budaya Pandeglang/targets (5).mind');
const parsed1 = unpack(data1);

console.log("Type of parsed1:", typeof parsed1);
console.log("Is array?", Array.isArray(parsed1));
if (Array.isArray(parsed1)) {
    console.log("Length of array:", parsed1.length);
    console.log("Keys in first element:", Object.keys(parsed1[0]));
} else {
    console.log("Keys in parsed:", Object.keys(parsed1));
}
