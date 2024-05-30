const cluster = require('cluster');
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const numCPUs = os.cpus().length;
const port = 3000;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(bodyParser.json({ limit: '100mb' }));
  const saveBase64Image = (folderPath, base64Data, ) => {
     const timestamp = Date.now();
     const randomNumber = Math.floor(Math.random() * 10000000000);
    let fileName = `image_${timestamp}_${randomNumber}`;
    if (typeof base64Data !== 'string') {
      throw new Error('Base64 data must be a string');
    }
    const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data');
    }
    const imageBuffer = Buffer.from(matches[2], 'base64');
    const extension = matches[1];
    const filePath = path.join(folderPath, `${fileName}.${extension}`);
    fs.writeFileSync(filePath, imageBuffer);
  };

  app.post('/upload_img', (req, res) => {
    const data = req.body;
    console.log(`Worker ${process.pid} handling request`);
    if (typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an object with folder names as keys and base64 images as values' });
    }

    const storageDir = path.join(__dirname, 'storage');

    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir);
    }

    try {
      Object.keys(data).forEach(folder => {
        const folderPath = path.join(storageDir, folder);

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        saveBase64Image(folderPath, data[folder]);
      });

      res.status(201).json({ message: 'Folders and images created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`Worker ${process.pid} started, API is running on http://localhost:${port}`);
  });
}
