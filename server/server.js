// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.put('/api/profile', (req, res) => {
  console.log("Received profile update:", req.body);
  res.json({ message: "Profile updated", data: req.body });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
