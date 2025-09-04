// Import necessary modules
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Create the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Create the 'public' and 'uploads' directories if they don't exist
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the directory where uploaded files will be stored
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Use the original filename with a timestamp to prevent duplicates
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Define a file filter function to validate file types
const fileFilter = (req, file, cb) => {
    // Allowed file types based on the HTML description
    const allowedMimeTypes = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    // Check if the uploaded file's MIME type is in the allowed list
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        // Reject the file and provide a helpful error message
        cb(new Error('Invalid file type. Only PNG, JPG, GIF, PDF, DOC, and DOCX are allowed.'), false);
    }
};

// Configure the multer middleware with the storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
});

// Serve static files from the 'public' directory
app.use(express.static(publicDir));

// Handle the file upload POST request
app.post('/upload', upload.single('uploadedFile'), (req, res, next) => {
    if (req.file) {
        console.log(`File uploaded successfully: ${req.file.path}`);
        res.status(200).send({
            message: 'File uploaded successfully!',
            filename: req.file.filename
        });
    } else {
        res.status(400).send({
            message: 'No file was uploaded.'
        });
    }
}, (error, req, res, next) => {
    if (error) {
        res.status(400).send({ message: error.message });
    } else {
        next();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
