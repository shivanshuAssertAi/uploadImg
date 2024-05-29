const axios = require('axios');
const fs = require('fs');

// Function to read a file and convert it to base64
const readFileAsBase64 = (filePath) => {
  const file = fs.readFileSync(filePath);
  return file.toString('base64');
};

// Prepare the data with folder names as keys and base64 encoded images as values
const data = {
  folder123: `data:image/png;base64,${readFileAsBase64('./img/Screenshot (60).png')}`,
  folder25656: `data:image/jpeg;base64,${readFileAsBase64('./img/Screenshot (61).png')}`
};

// Call the API using Axios
axios.post('http://localhost:3000/upload_img', data, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Success:', response.data);
})
.catch(error => {
  console.error('Error:', error.response ? error.response.data : error.message);
});
