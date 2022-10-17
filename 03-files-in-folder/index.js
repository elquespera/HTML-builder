const path = require('path');
const fs = require('fs/promises');

const folder = 'secret-folder';

const listFiles = async () => {
  const folderName = path.join(__dirname, folder);
  const dir = await fs.readdir(folderName, { withFileTypes: true });
  dir.forEach(async (file) => {
    if (file.isFile()) {
      const stats = await fs.stat(path.join(__dirname, folder, file.name));
      const size = `${(stats.size / 1024).toFixed(3)}kb`;
      const [name, ext] = file.name.split('.')
      console.log("\x1b[35m", name, "\x1b[0m", '-', "\x1b[34m", ext, "\x1b[0m", '-', "\x1b[32m", size, "\x1b[0m");
    }
  });
}

listFiles();