const fs = require("fs");
const path = require("path");

const factoriesDir = path.join(__dirname, "build", "factories");
const filePath = path.join(factoriesDir, "mockProfiles.factory.js");
console.log(`running file ${filePath}`);
require(filePath);
