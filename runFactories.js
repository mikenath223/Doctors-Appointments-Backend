const fs = require("fs");
const path = require("path");

const factoriesDir = path.join(__dirname, "build", "factories");

fs.readdirSync(factoriesDir).forEach((file) => {
  if (file.endsWith(".js")) {
    require(path.join(factoriesDir, file));
  }
});
