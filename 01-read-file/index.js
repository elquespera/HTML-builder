const path = require('path');
const fs = require('fs/promises');


const read = async () => {
  const fileName = path.join(__dirname, 'text.txt');
  let handle;
  try { 
    handle = await fs.open(fileName, 'r');
    const readable = handle.createReadStream({ encoding: "utf8" });
    for await (const chunk of readable) {
        process.stdout.write(chunk);
    }
  }
  finally {
    handle?.close();
  }
}

read();