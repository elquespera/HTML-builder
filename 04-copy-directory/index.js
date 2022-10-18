
const path = require('path');
const fs = require('fs/promises');

const copyDir = async (inputPath, outputPath) => {
  await fs.rm(outputPath, { recursive: true, force: true });
  await fs.mkdir(outputPath, { recursive: true });

  const inputDir = await fs.readdir(inputPath, { withFileTypes: true });
  for (const file of inputDir) {
    if (file.isFile()) {
      console.log(`Copying \x1b[35m${file.name}\x1b[0m`);
      let inputHandle, outputHandle;
      try {
        inputHandle = await fs.open(path.join(inputPath, file.name), 'r');
        outputHandle = await fs.open(path.join(outputPath, file.name), 'w');
        const inputStream = inputHandle.createReadStream({ encoding: "utf8" });
        const outputStream = outputHandle.createWriteStream({ encoding: "utf8" });
        inputStream.pipe(outputStream);  
      }
      finally {
        inputHandle?.close();
        outputHandle?.close();
      }
    }
  }
}

copyDir(
  path.join(__dirname, 'files'),
  path.join(__dirname, 'files-copy'),
);