import express from 'express';
import fs from 'fs';
import startCase from 'lodash/startCase.js';

const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send(`Cryptobot v1.1.1
<br>---------------------
<br>Symbol: ${process.env.SYMBOL.replace('USDT', '/USDT')}
<br>Interval: ${process.env.INTERVAL}
<br>Strategy: ${startCase(process.env.STRATEGY)}`);
});

app.get('/logs', (req, res) => {
  fs.readFile(process.env.LOG_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    const slicedData = data.slice(-10000);
    res.type('text/plain').send(slicedData);
  });
});

app.listen(port);
