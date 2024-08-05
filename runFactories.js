const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);
const factoriesDir = path.join(__dirname, "build", "factories");

const runFile = async (filePath) => {
  try {
    console.log(`running file ${filePath}`);
    const { stdout, stderr } = await execPromise(`node ${filePath}`);
    if (stderr) {
      console.error(`stderr for file ${filePath}: ${stderr}`);
    }
    console.log(`stdout for file ${filePath}: ${stdout}`);
  } catch (error) {
    console.error(`Error executing file ${filePath}: ${error.message}`);
  }
};

const runFilesSequentially = async () => {
  try {
    const files = await fs.promises.readdir(factoriesDir);
    for (const file of files) {
      const filePath = path.join(factoriesDir, file);
      if (file.endsWith(".js")) {
        await runFile(filePath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
};

runFilesSequentially();
