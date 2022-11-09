
const path = require('path');
const fs = require('fs/promises');
const { pipeline } = require('stream/promises');

const copyDir = async (inputPath, outputPath) => {
  await fs.rm(outputPath, { recursive: true, force: true });
  await fs.mkdir(outputPath, { recursive: true });

  const inputDir = await fs.readdir(inputPath, { withFileTypes: true });
  for (const file of inputDir) {
    const from = path.join(inputPath, file.name);
    const to = path.join(outputPath, file.name);
    if (file.isFile()) {
      console.log(`Copying \x1b[35m${file.name}\x1b[0m`);
      let inputHandle, outputHandle;
      try {
        inputHandle = await fs.open(from, 'r');
        outputHandle = await fs.open(to, 'w');
        const inputStream = inputHandle.createReadStream();
        const outputStream = outputHandle.createWriteStream();
        await pipeline(inputStream, outputStream);
      }
      finally {
        inputHandle?.close();
        outputHandle?.close();
      }
    } else 
    if (file.isDirectory()) {
      await copyDir(from, to);
    }
  }
}

copyDir(
  path.join(__dirname, 'files'),
  path.join(__dirname, 'files-copy'),
);