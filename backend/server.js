// FILE: backend/server.js
// Entry point — sets up Express, middleware, routes, and starts the server.

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Middleware ──
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/roommate',   require('./routes/roommate'));
app.use('/api/admin',      require('./routes/admin'));

// ── Health check ──
app.get('/api', (req, res) => res.json({ status: 'CampuStay API running ✅' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── DB + Start ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running at: http://localhost:${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

module.exports = app;
