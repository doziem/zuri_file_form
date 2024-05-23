const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const path = require('path');

const PORT =  3000;

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const formData = JSON.parse(body);
      const errors = validateForm(formData);

      if (errors.length === 0) {
        saveJsonDatabase(formData);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Form submitted successfully!');
      } else {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ errors }));
      }
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on: ${PORT}`);
});

function validateForm(formData) {
  const errors = [];

  const firstName = formData.firstName.trim();
  const lastName = formData.lastName.trim();
  const email = formData.email.trim();
  const phone = formData.phone.trim();
  const gender = formData.gender.trim();

  if (!firstName) {
    errors.push('First Name is required.');
  }

  if (!lastName) {
    errors.push('Last Name is required.');
  }

  if(firstName.length < 1 || lastName.length <1){
    errors.push('Name cannot be less than 1 character.');
  }
  

  if (!isValidEmail(email)) {
    errors.push('Invalid email');
  }

  if (!isValidPhoneNumber(phone)) {
    errors.push('Invalid Phone number.');
  }

  if (!gender) {
    errors.push('Please Gender is required.');
  }

  return errors;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^\d{11}$/;
  return phoneRegex.test(phone);
}

function saveJsonDatabase(formData) {
  fs.readFile('database.json', (err, data) => {
    
     let jsonData =[];
     if(!err){
      jsonData= JSON?.parse(data);

     }else{
      console.log('Internal Server Error',err);
     }
    jsonData.push(formData);
    fs.writeFile('database.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error('Error writing to database:', err);
      } else {
        console.log('Form data saved to database.json');
      }
    });
  });
}
