const http = require('http');
const fs = require('fs');
const { parse } = require('querystring');
const path = require('path');

const PORT = process.env.PORT || 3000;

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
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const formData = parse(body);
      const errors = validateForm(formData);

      if (errors.length === 0) {
        saveToDatabase(formData);
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
  console.log(`Server is running on:${PORT}`);
});

function validateForm(formData) {
  const errors = [];

  const firstName = formData.firstName?.trim();
  const lastName = formData.lastName?.trim();
  const otherNames = formData.otherNames?.trim();
  const email = formData.email?.trim();
  const phone = formData.phone?.trim();
  const gender = formData.gender?.trim();

  if (!firstName || !lastName) {
    errors.push('First Name and Last Name are required.');
  }

  if (firstName?.length < 1 || lastName?.length < 1) {
    errors.push('Name cannot be less than 1 character.');
  }

  if (!/^[a-zA-Z]+$/.test(firstName) || !/^[a-zA-Z]+$/.test(lastName) || (otherNames && !/^[a-zA-Z\s]*$/.test(otherNames))) {
    errors.push('Names cannot contain numbers.');
  }

  if (!isValidEmail(email)) {
    errors.push('Invalid email address.');
  }

  if (!isValidPhoneNumber(phone)) {
    errors.push('Invalid phone number.');
  }

  if (!gender) {
    errors.push('Gender is required.');
  }

  return errors;
}

function isValidEmail(email) {
  const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

function saveToDatabase(formData) {
  fs.readFile('database.json', (err, data) => {
    const jsonData = err ? [] : JSON.parse(data);
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
