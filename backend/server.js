const express = require('express');
const { Pool } = require('pg');
 const multer = require('multer');
 const path = require('path');

const app = express();
app.use(express.json());

const storage = multer.diskStorage(
    {
        destination: "public/uploads",
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname))
        }
    }
)

const upload = multer({ storage })

const pool = new Pool({
    user: 'postgres',
    password: 'senai',
    host: 'localhost',
    port: 5432,
    database: 'streamFlix',
});

app.listen(3000, () =>
  console.log('Servidor rodando em http://localhost:3000'),
);
