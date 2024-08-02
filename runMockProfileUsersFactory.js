const fs = require("fs");
const path = require("path");

const factoriesDir = path.join(__dirname, "build", "factories");
const mockProfilesFactoryPath = path.join(
  factoriesDir,
  "mockProfiles.factory.js"
);

require(mockProfilesFactoryPath);
