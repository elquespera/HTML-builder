const path = require('path');
const fs = require('fs/promises');

const styleExt = '.css';

const bundle = async (inputPath, outputPath) => {
  const styles = [];
  const inputDir = await fs.readdir(inputPath, { withFileTypes: true });
  for (const file of inputDir) {
    if (file.isFile() && path.extname(file.name) === styleExt) {
      console.log(`Processing \x1b[35m${file.name}\x1b[0m`);
      let inputHandle;
      try {
        inputHandle = await fs.open(path.join(inputPath, file.name), 'r');
        const inputStream = inputHandle.createReadStream({ encoding: "utf8" });
        for await (const chunk of inputStream) {
          styles.push(chunk.toString('utf8'));   
        }
      }
      finally {
        await inputHandle?.close();
      }
    }
  }
  
  let outputHandle;
  try {
    outputHandle = await fs.open(outputPath, 'w');    
    outputStream = outputHandle.createWriteStream({ encoding: "utf8" });
    styles.forEach(style => outputStream.write(style));
  } 
  finally {
    outputHandle?.close();
  }
}

bundle(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);