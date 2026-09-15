const express = require('express');
const cors = require('cors');
const path = require('path');

const scriptsRoutes = require('./routes/scripts');
const executorsRoutes = require('./routes/executors');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const feedsRoutes = require('./routes/feeds');
const uploadRoutes = require('./routes/upload');
const accountsRoutes = require('./routes/accounts');
const analyticsRoutes = require('./routes/analytics');
const backupsRoutes = require('./routes/backups');
const activityRoutes = require('./routes/activity');

function wrapAsync(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

// wrap every route handler in each router so thrown/rejected promises reach the error handler below,
// instead of crashing the process or hanging the request
function autoWrap(router) {
  router.stack.forEach((layer) => {
    if (layer.route) {
      layer.route.stack.forEach((l) => {
        l.handle = wrapAsync(l.handle);
      });
    }
  });
  return router;
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', autoWrap(authRoutes));
app.use('/api', autoWrap(scriptsRoutes));
app.use('/api', autoWrap(executorsRoutes));
app.use('/api', autoWrap(settingsRoutes));
app.use('/api', autoWrap(accountsRoutes));
app.use('/api', autoWrap(analyticsRoutes));
app.use('/api', autoWrap(backupsRoutes));
app.use('/api', autoWrap(activityRoutes));
app.use('/api', uploadRoutes); // handles its own errors internally (multer callback style)
app.use('/', autoWrap(feedsRoutes)); // sitemap.xml / rss.xml served at the site root, not under /api

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// centralized error handler — keeps DB/JWT errors from leaking stack traces to the client
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
