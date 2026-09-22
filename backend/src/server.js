const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const { supabase } = require('./services/supabaseClient');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend running on http://localhost:5173
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Campus2Career API server is healthy',
    timestamp: new Date().toISOString(),
    supabaseConnected: Boolean(supabase)
  });
});

// Root endpoint info
app.get('/', (req, res) => {
  res.json({
    name: 'Campus2Career API',
    status: 'running',
    docs: 'See API_SPEC.md at project root'
  });
});

// Global error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Campus2Career] Server listening on port ${PORT}`);
    console.log(`[Campus2Career] Health check available at http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
