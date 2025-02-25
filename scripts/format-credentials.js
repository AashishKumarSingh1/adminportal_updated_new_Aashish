const fs = require('fs');

// Read your credentials file
const credentials = require('./your-credentials.json');

// Convert to properly escaped string
const formattedCreds = JSON.stringify(credentials).replace(/\\n/g, '\\n');

console.log('GOOGLE_DRIVE_CREDENTIALS=' + formattedCreds); 