import express from 'express';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Cryptobot v1.0.0');
});

app.get('/logs', (req, res) => {
  fs.readFile(process.env.LOG_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo de logs');
    }
    const slicedData = data.slice(-10000);
    res.type('text/plain').send(slicedData);
  });
});

app.listen(port);
