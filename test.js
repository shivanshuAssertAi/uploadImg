const fs = require('fs');
const axios = require('axios');

const readFileAsBase64 = (filePath) => {
  const file = fs.readFileSync(filePath);
  return file.toString('base64');
};

const uploadImages = async () => {
  try {
    // Prepare the data with folder names as keys and base64 encoded images as values
    const data = {
      folder123: `data:image/png;base64,${readFileAsBase64('./img/Screenshot (60).png')}`,
      folder25656: `data:image/jpeg;base64,${readFileAsBase64('./img/Screenshot (61).png')}`
    };

    // Call the API using Axios
    const response = await axios.post('http://localhost:3000/upload_img', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};


setInterval(async() => {
    await uploadImages();
}, 100);
setInterval(async() => {
    await uploadImages();
}, 200);
setInterval(async() => {
    await uploadImages();
}, 300);