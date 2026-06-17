const { pack, unpack } = require('msgpackr');
const fs = require('fs');

const files = [
    'C:/Antigravity/Web/PROJECT VR/New Publick/Bale Budaya Pandeglang/targets (5).mind',
    'C:/Antigravity/Web/PROJECT VR/New Publick/Kraton Kaibon/targets (6).mind',
    'C:/Antigravity/Web/PROJECT VR/New Publick/Masjid Agung Banten Lama/targets (4).mind',
    'C:/Antigravity/Web/PROJECT VR/New Publick/Menara Air Pandeglang/targets (7).mind',
    'C:/Antigravity/Web/PROJECT VR/New Publick/Menara Banten Lama/targets (9).mind'
];

let version = null;
let mergedDataList = [];

for (const file of files) {
    const data = fs.readFileSync(file);
    const parsed = unpack(data);
    if (!version) version = parsed.v;
    
    // Concatenate the dataList
    mergedDataList = mergedDataList.concat(parsed.dataList);
}

const mergedObject = {
    v: version,
    dataList: mergedDataList
};

const mergedBuffer = pack(mergedObject);
fs.writeFileSync('C:/Antigravity/Web/PROJECT VR/assets/targets.mind', mergedBuffer);
console.log("SUCCESS! Merged targets.mind created with", mergedDataList.length, "targets.");
