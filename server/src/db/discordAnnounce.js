const { readJson } = require('./store');

// Fires a message to the configured Discord webhook, if one is set.
// Never throws — a failed announcement should never break the admin action
// that triggered it.
async function announceToDiscord(content) {
  try {
    const settings = await readJson('settings.json');
    const url = settings.discordWebhookUrl;
    if (!url) return;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
  } catch (err) {
    console.error('Discord announce failed:', err.message);
  }
}

module.exports = { announceToDiscord };
