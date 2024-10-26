import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Cryptobot is running!');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
