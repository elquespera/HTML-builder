const path = require('path');
const fs = require('fs/promises');
const { pipeline } = require('stream/promises');

const bundle = async (distPath) => {
  const printMsg = (msg) => {
    console.log('\n\n');
    console.log('*'.repeat(msg.length + 8));
    console.log(`\x1b[1m*   ${msg}   *\x1b[0m`);
    console.log('*'.repeat(msg.length + 8) + '\n');
  }

  console.log(`\x1b[1mBuilding project in \x1b[34m${distPath}\x1b[0m`);
  await fs.rm(distPath, { recursive: true, force: true });
  await fs.mkdir(distPath, { recursive: true });

  printMsg('Building index.html from template');
  await makeTemplate(path.join(__dirname, 'template.html'), distPath);

  printMsg('Bundling styles.css');
  await bundleStyles(path.join(__dirname, 'styles'), path.join(distPath, 'style.css'));

  printMsg('Copying assets');
  await copyDir(path.join(__dirname, 'assets'), path.join(distPath, 'assets'));
  console.log(`\x1b[1m\n\nThe project is available at \x1b[34m${distPath}/index.html\x1b[0m`);
}

const makeTemplate = async (templateName, distPath) => {
  const fetchFile = async (fileName) => {
    let handle;
    let result = '';
    try { 
      handle = await fs.open(fileName, 'r');
      const readable = handle.createReadStream({ encoding: "utf8" });
      for await (const chunk of readable) {
        result += chunk.toString('utf8');
      }
    }
    finally {
      await handle?.close();
    }
    return result;
  }
  const componentTemplate = /{{\w+}}/;
  let template = await fetchFile(templateName);
  let match;
  do {
    match = template.match(componentTemplate);
    if (!match) break;
    const componentName = match[0].slice(2, -2);
    console.log(`Fetching \x1b[35m${componentName}\x1b[0m component`);
    const component = await fetchFile(path.join(__dirname, 'components', `${componentName}.html`));
    template = template.replace(componentTemplate, component);
  } while (match);

  let outputHandle;
  try {
    outputHandle = await fs.open(path.join(distPath, 'index.html'), 'w');    
    outputStream = outputHandle.createWriteStream({ encoding: "utf8" });
    outputStream.write(template);
  } 
  finally {
    outputHandle?.close();
  }
}

const bundleStyles = async (inputPath, outputPath) => {
  const styleExt = '.css';  
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

bundle(path.join(__dirname, 'project-dist'));