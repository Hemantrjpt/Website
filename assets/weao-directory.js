(() => {
  'use strict';
  const grid = document.getElementById('weao-grid');
  const message = document.getElementById('weao-message');
  const updated = document.getElementById('weao-updated');
  const search = document.getElementById('weao-search');
  const platform = document.getElementById('weao-platform');
  const detection = document.getElementById('weao-detection');
  if (!grid || !message) return;

  let executors = [];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  };
  const badge = (text, className = '') => '<span class="weao-pill ' + className + '">' + esc(text) + '</span>';

  function render() {
    const query = (search.value || '').trim().toLowerCase();
    const chosenPlatform = platform.value;
    const chosenDetection = detection.value;
    const filtered = executors.filter((item) => {
      const matchesQuery = [item.title, item.version, item.platform].join(' ').toLowerCase().includes(query);
      const matchesPlatform = !chosenPlatform || item.platform === chosenPlatform;
      const matchesDetection = !chosenDetection || (chosenDetection === 'detected' ? item.detected === true : item.detected === false);
      return matchesQuery && matchesPlatform && matchesDetection;
    });

    if (!filtered.length) {
      grid.innerHTML = '';
      message.hidden = false;
      message.textContent = executors.length ? 'No executors match these filters.' : 'No public status entries are currently available.';
      return;
    }

    message.hidden = true;
    grid.innerHTML = filtered.map((item) => {
      const logo = safeUrl(item.logo);
      const website = safeUrl(item.website);
      const discord = safeUrl(item.discord);
      const detectBadge = item.detected === true
        ? badge('Detected', 'detected')
        : item.detected === false ? badge('Not marked detected', 'undetected') : badge('Detection unknown');
      const updateBadge = item.updateStatus === true
        ? badge('Updated', 'updated')
        : item.updateStatus === false ? badge('Update pending', 'outdated') : badge('Update unknown');
      const platformLabel = item.platform || 'Unknown platform';
      return '<article class="weao-card">' +
        '<div class="weao-card-head">' +
          (logo ? '<img class="weao-logo" src="' + esc(logo) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'weao-logo-fallback\',textContent:' + JSON.stringify((item.title || '?').slice(0,1).toUpperCase()) + '}))">' : '<span class="weao-logo-fallback" aria-hidden="true">' + esc((item.title || '?').slice(0,1).toUpperCase()) + '</span>') +
          '<div style="min-width:0"><div class="weao-title">' + esc(item.title) + '</div><div class="weao-version">' + esc(item.version ? 'Version ' + item.version : 'Version not provided') + '</div></div>' +
        '</div>' +
        '<div class="weao-status-row">' + detectBadge + updateBadge + '</div>' +
        '<div class="weao-details"><div><strong>Platform:</strong> ' + esc(platformLabel) + '</div><div><strong>Last update:</strong> ' + esc(item.updatedDate || 'Not provided') + '</div></div>' +
        '<div class="weao-actions">' +
          (website ? '<a class="weao-action" href="' + esc(website) + '" target="_blank" rel="noopener noreferrer">Website ↗</a>' : '') +
          (discord ? '<a class="weao-action" href="' + esc(discord) + '" target="_blank" rel="noopener noreferrer">Discord ↗</a>' : '') +
          '<a class="weao-action" href="https://weao.xyz/" target="_blank" rel="noopener noreferrer">Source ↗</a>' +
        '</div></article>';
    }).join('');
  }

  async function load() {
    message.hidden = false;
    message.textContent = 'Loading latest status data…';
    try {
      const response = await fetch('/api/weao-exploits', { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Status API returned HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data.executors)) throw new Error('Unexpected status response');
      executors = data.executors;
      const platforms = [...new Set(executors.map((item) => item.platform).filter(Boolean))].sort();
      platform.innerHTML = '<option value="">All platforms</option>' + platforms.map((value) => '<option value="' + esc(value) + '">' + esc(value) + '</option>').join('');
      updated.textContent = 'Source: WEAO · refreshed ' + new Date(data.fetchedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      render();
    } catch (error) {
      grid.innerHTML = '';
      message.hidden = false;
      message.textContent = 'Live status is temporarily unavailable. Please try again later; the curated executor list above is still available.';
      updated.textContent = 'Live data unavailable';
      console.warn('TITANIC HUB WEAO directory:', error.message);
    }
  }

  search.addEventListener('input', render);
  platform.addEventListener('change', render);
  detection.addEventListener('change', render);
  load();
  window.setInterval(load, 5 * 60 * 1000);
})();
