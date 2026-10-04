/**
 * AFHAM AHAMED — AUTOMATIC GITHUB REPOSITORY INTEGRATION
 * Username: afhamahamed7126-dotcom
 * Features: Public REST API, local cache to prevent rate-limiting, live repo sorting
 */

const GITHUB_USERNAME = 'afhamahamed7126-dotcom';
const CACHE_KEY = 'afham_github_repos_v2';
const CACHE_PROFILE_KEY = 'afham_github_profile_v2';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache

document.addEventListener('DOMContentLoaded', () => {
  fetchGitHubData();
});

async function fetchGitHubData() {
  const reposContainer = document.getElementById('github-repos-grid');
  const profileContainer = document.getElementById('github-profile-summary');
  if (!reposContainer) return;

  // 1. Check local cache
  const cachedRepos = getWithExpiry(CACHE_KEY);
  const cachedProfile = getWithExpiry(CACHE_PROFILE_KEY);

  if (cachedRepos && cachedRepos.length >= 0) {
    renderRepos(cachedRepos, reposContainer);
    if (cachedProfile && profileContainer) {
      renderProfileSummary(cachedProfile, profileContainer, cachedRepos.length);
    }
    return;
  }

  // 2. Fetch fresh data from GitHub Public REST API
  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`)
    ]);

    if (!reposRes.ok) {
      if (reposRes.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error(`GitHub API error (${reposRes.status})`);
    }

    const reposData = await reposRes.json();
    const profileData = profileRes.ok ? await profileRes.json() : null;

    // Filter out forks if desired, or keep original work first, sorted by updated date desc
    const sortedRepos = Array.isArray(reposData) 
      ? reposData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      : [];

    // Store in cache
    setWithExpiry(CACHE_KEY, sortedRepos, CACHE_TTL);
    if (profileData) {
      setWithExpiry(CACHE_PROFILE_KEY, profileData, CACHE_TTL);
    }

    renderRepos(sortedRepos, reposContainer);
    if (profileData && profileContainer) {
      renderProfileSummary(profileData, profileContainer, sortedRepos.length);
    }
  } catch (error) {
    console.warn('GitHub API request failed:', error.message);
    renderErrorState(reposContainer, error.message);
  }
}

function renderRepos(repos, container) {
  if (!repos || repos.length === 0) {
    container.innerHTML = `
      <div class="state-box">
        <div class="state-icon"><i class="fab fa-github"></i></div>
        <h4>No Public Repositories Found</h4>
        <p>No public repositories are currently available on GitHub for @${GITHUB_USERNAME}.</p>
        <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          <i class="fab fa-github"></i> View Profile on GitHub
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = repos.map(repo => {
    const lang = repo.language || 'Code';
    const langColor = getLanguageColor(lang);
    const updatedDate = formatDate(repo.updated_at);
    const description = repo.description || 'Public GitHub development repository created by Afham Ahamed.';
    const topics = repo.topics || [];

    return `
      <article class="repo-card reveal-init">
        <div class="repo-header">
          <h3 class="repo-name">
            <i class="fas fa-book-bookmark" style="color:var(--accent-cyan); font-size:0.95rem; margin-right:6px;"></i>
            ${escapeHtml(repo.name)}
          </h3>
          <span class="badge" style="font-size:0.75rem;">${repo.visibility || 'Public'}</span>
        </div>

        <p class="repo-desc">${escapeHtml(description)}</p>

        ${topics.length > 0 ? `
          <div class="repo-topics">
            ${topics.slice(0, 4).map(t => `<span class="repo-topic-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}

        <div class="repo-footer">
          <div class="repo-stats">
            <span class="repo-stat-item">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${langColor};"></span>
              ${escapeHtml(lang)}
            </span>
            <span class="repo-stat-item" title="Stars">
              <i class="far fa-star"></i> ${repo.stargazers_count || 0}
            </span>
            <span class="repo-stat-item" title="Forks">
              <i class="fas fa-code-branch"></i> ${repo.forks_count || 0}
            </span>
          </div>

          <div style="font-size:0.78rem;">
            Updated ${updatedDate}
          </div>
        </div>

        <div style="margin-top:16px;">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="width:100%;">
            <i class="fab fa-github"></i> View on GitHub
          </a>
        </div>
      </article>
    `;
  }).join('');

  if (window.observeNewElements) {
    window.observeNewElements();
  }
}

function renderProfileSummary(profile, container, repoCount) {
  container.innerHTML = `
    <div class="github-profile-preview">
      <img src="${profile.avatar_url || 'assets/images/profile-placeholder.svg'}" alt="${profile.name || GITHUB_USERNAME}" class="github-avatar" onerror="this.src='assets/images/profile-placeholder.svg';">
      <div>
        <h3 style="font-size:1.25rem; margin-bottom:4px;">${escapeHtml(profile.name || 'Afham Ahamed')}</h3>
        <p style="font-size:0.88rem; color:var(--text-accent); margin:0;">@${escapeHtml(profile.login)}</p>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">${escapeHtml(profile.bio || 'Developer & AI Enthusiast')}</p>
      </div>
    </div>

    <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
      <div style="text-align:center; padding:8px 16px; background:var(--bg-surface); border-radius:8px; border:1px solid var(--border-subtle);">
        <span style="font-size:0.78rem; color:var(--text-muted); display:block;">PUBLIC REPOSITORIES</span>
        <strong style="font-size:1.2rem; color:var(--text-primary);">${profile.public_repos || repoCount}</strong>
      </div>
      <a href="${profile.html_url || `https://github.com/${GITHUB_USERNAME}`}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <i class="fab fa-github"></i> Visit GitHub Profile
      </a>
    </div>
  `;
}

function renderErrorState(container, message) {
  container.innerHTML = `
    <div class="state-box">
      <div class="state-icon"><i class="fas fa-satellite-dish"></i></div>
      <h4>Unable to load GitHub projects right now</h4>
      <p>The public GitHub API is currently unreachable or temporarily rate-limited.</p>
      <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <i class="fab fa-github"></i> Open @${GITHUB_USERNAME} on GitHub
      </a>
    </div>
  `;
}

// Helpers
function getLanguageColor(lang) {
  const colors = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'HTML': '#e34f26',
    'CSS': '#563d7c',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Python': '#3572A5',
    'C': '#555555',
    'C++': '#f34b7d',
    'Java': '#b07219',
    'Dart': '#00B4AB',
    'Shell': '#89e051'
  };
  return colors[lang] || '#00f2fe';
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.round((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 'today';
  if (diffDays < 30) return `${diffDays} days ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}

function setWithExpiry(key, value, ttl) {
  const item = {
    value: value,
    expiry: Date.now() + ttl
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    // LocalStorage quota or disabled
  }
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
