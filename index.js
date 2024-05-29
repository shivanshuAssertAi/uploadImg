const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json({limit:"100mb"}));

// Function to decode base64 and save image
const saveBase64Image = (folderPath, base64Data, fileName) => {
  // Check if base64Data is a string
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

// POST endpoint to create folders and save images
app.post('/upload_img', (req, res) => {
  const data = req.body;

  if (typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ error: 'Data must be an object with folder names as keys and base64 images as values' });
  }

  const storageDir = path.join(__dirname, 'storage');

  // Create storage directory if it doesn't exist
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
  }

  try {
    // Iterate over data to create folders and save images
    Object.keys(data).forEach(folder => {
      const folderPath = path.join(storageDir, folder);

      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      // Save the base64 image to the folder
      saveBase64Image(folderPath, data[folder], 'image');
    });

    res.status(201).json({ message: 'Folders and images created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
