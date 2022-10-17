const path = require('path');
const fs = require('fs/promises');

const printMsg = (...msg) => console.log("\x1b[1m", "\x1b[36m", ...msg); 

const sayBye = () => printMsg('The program has exited and the file was saved. Bye!');

const write = async () => {
  const fileName = path.join(__dirname, 'text.txt');
  let handle;
  try { 
    handle = await fs.open(fileName, 'w');
    printMsg('Please input text to be written to the file line by line.');
    printMsg("Type 'exit' and press Enter or press Ctrl+C to finish input.", "\x1b[0m");
    const writable = handle.createWriteStream({ encoding: "utf8" });
    for await (const chunk of process.stdin) {
      if (chunk.toString('utf8').trim() === 'exit') {
        sayBye();
        break;
      }
      writable.write(chunk);
    }
  }
  finally {
    await handle?.close();
  }
}

process.on('SIGINT', () => {
  sayBye();
  process.exit();
});

write();