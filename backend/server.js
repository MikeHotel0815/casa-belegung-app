const express = require('express');
const app = express();
const port = 3001;

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend is healthy' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
