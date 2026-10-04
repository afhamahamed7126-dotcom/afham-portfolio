/**
 * AFHAM AHAMED — FEATURED PROJECTS & MODAL SYSTEM
 */

let allProjects = [];
let currentCategory = 'All';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadCertificates();
  initProjectControls();
  initModalListeners();
});

async function loadCertificates() {
  const container = document.getElementById('certificates-container');
  if (!container) return;

  try {
    const res = await fetch('data/certificates.json');
    if (!res.ok) return;
    const certs = await res.json();
    if (Array.isArray(certs) && certs.length > 0) {
      container.innerHTML = certs.map(c => `
        <article class="achievement-card reveal-init">
          <div class="achievement-icon"><i class="fas fa-certificate"></i></div>
          <div class="achievement-info" style="width:100%;">
            <h4>${c.name}</h4>
            <p class="achievement-meta">${c.organization} • ${c.date}</p>
            <p style="font-size:0.92rem; color:var(--text-secondary); margin-bottom:12px;">${c.description}</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              ${c.image ? `<button class="btn btn-outline btn-sm" onclick="openLightbox(['${c.image}'])"><i class="fas fa-eye"></i> View</button>` : ''}
              ${c.pdf ? `<a href="${c.pdf}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Download</a>` : ''}
            </div>
          </div>
        </article>
      `).join('');
      if (window.observeNewElements) window.observeNewElements();
    }
  } catch (e) {
    // Graceful fallback already present in HTML
  }
}

async function loadProjects() {
  const container = document.getElementById('featured-projects-grid');
  if (!container) return;

  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    allProjects = await res.json();
    renderProjects();
  } catch (err) {
    console.error('Failed to load projects.json:', err);
    container.innerHTML = `
      <div class="state-box">
        <div class="state-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h4>Unable to Load Featured Projects</h4>
        <p>The structured projects data could not be retrieved at this moment.</p>
        <button class="btn btn-secondary" onclick="loadProjects()">
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>
    `;
  }
}

function initProjectControls() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('project-search-input');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'All';
      renderProjects();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderProjects();
    });
  }
}

function renderProjects() {
  const container = document.getElementById('featured-projects-grid');
  if (!container) return;

  const filtered = allProjects.filter(project => {
    // Category match
    const matchCategory = currentCategory === 'All' || 
      (project.categories && project.categories.includes(currentCategory)) ||
      (currentCategory === 'Academic' && project.type?.includes('Academic')) ||
      (currentCategory === 'Personal' && project.type?.includes('Personal')) ||
      (currentCategory === 'Community' && project.type?.includes('Community'));

    // Search query match
    if (!matchCategory) return false;
    if (!currentSearch) return true;

    const searchableText = [
      project.title,
      project.description,
      project.subtitle,
      project.problem,
      project.role,
      ...(project.techStack?.languages || []),
      ...(project.techStack?.frameworks || []),
      ...(project.techStack?.tools || []),
      project.techStack?.frontend || '',
      project.techStack?.backend || '',
      project.techStack?.database || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(currentSearch);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="state-box">
        <div class="state-icon"><i class="fas fa-search"></i></div>
        <h4>No Matching Projects Found</h4>
        <p>Try searching for different keywords or select a different category filter.</p>
        <button class="btn btn-outline btn-sm" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(project => {
    const isCompleted = project.status === 'Completed';
    const statusBadgeClass = isCompleted ? 'badge-green' : 'badge-amber';
    
    // Tech badges preview
    const stackItems = [
      ...(project.techStack?.languages || []),
      ...(project.techStack?.frameworks || [])
    ].slice(0, 4);

    // Cover image path with fallback
    const coverSrc = project.media?.coverImage || 'assets/images/placeholder-image.svg';

    // Action buttons handling (no broken buttons)
    const githubBtn = project.links?.github
      ? `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="View GitHub Repository"><i class="fab fa-github"></i> GitHub</a>`
      : `<span class="badge" title="Repository coming soon"><i class="fab fa-github"></i> Soon</span>`;

    const liveBtn = project.links?.liveDemo
      ? `<a href="${project.links.liveDemo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Live Demo</a>`
      : `<span class="badge" title="${project.links?.liveDemoText || 'Coming Soon'}"><i class="fas fa-desktop"></i> ${project.links?.liveDemoText || 'Coming Soon'}</span>`;

    return `
      <article class="project-card reveal-init">
        <div class="project-card-media">
          <img src="${coverSrc}" 
               alt="${project.title} Preview" 
               class="project-cover-img" 
               loading="lazy"
               onerror="this.onerror=null; this.src='assets/images/placeholder-image.svg';">
          <div class="project-badges-overlay">
            <span class="badge ${statusBadgeClass}"><i class="fas fa-circle" style="font-size:0.5rem"></i> ${project.status}</span>
            <span class="badge"><i class="fas fa-calendar-alt"></i> ${project.year}</span>
          </div>
        </div>

        <div class="project-card-body">
          <div class="project-meta-strip">
            <span><i class="fas fa-tag"></i> ${project.type}</span>
            <span><i class="fas fa-layer-group"></i> ${project.categories.join(' • ')}</span>
          </div>

          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-desc">${project.description}</p>

          <div class="project-tech-badges">
            ${stackItems.map(tech => `<span class="tech-badge"><i class="fas fa-code"></i> ${tech}</span>`).join('')}
          </div>

          <div class="project-actions">
            <button class="btn btn-outline btn-sm" onclick="openProjectModal('${project.id}')">
              <i class="fas fa-info-circle"></i> View Details
            </button>
            ${githubBtn}
            ${liveBtn}
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Re-observe revealed items
  if (window.observeNewElements) {
    window.observeNewElements();
  }
}

function resetFilters() {
  currentCategory = 'All';
  currentSearch = '';
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === 'All');
  });
  renderProjects();
}

/**
 * Project Details Modal Controller
 */
function initModalListeners() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

window.openProjectModal = function(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const container = document.getElementById('modal-dynamic-content');
  if (!modal || !container) return;

  // Media previews
  const screenshots = project.media?.screenshots || [];
  const primaryCover = project.media?.coverImage || 'assets/images/placeholder-image.svg';

  const screenshotsHtml = screenshots.length > 0
    ? `
      <div class="modal-gallery-wrap">
        <div class="modal-main-preview" onclick="openLightboxFromModal(0)">
          <img id="modal-active-img" src="${primaryCover}" alt="${project.title} Preview" class="modal-main-img" onerror="this.onerror=null; this.src='assets/images/placeholder-image.svg';">
          <div style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.7); padding:4px 12px; border-radius:12px; font-size:0.8rem; color:#fff;">
            <i class="fas fa-expand"></i> Click to Enlarge
          </div>
        </div>
        <div class="modal-thumbnails-strip">
          <div class="modal-thumb active" onclick="switchModalImage('${primaryCover}', 0, this)">
            <img src="${primaryCover}" alt="Cover" onerror="this.onerror=null; this.src='assets/images/placeholder-image.svg';">
          </div>
          ${screenshots.map((s, idx) => `
            <div class="modal-thumb" onclick="switchModalImage('${s.src}', ${idx}, this)" title="${s.caption || ''}">
              <img src="${s.src}" alt="${s.caption || 'Screenshot'}" onerror="this.onerror=null; this.src='assets/images/placeholder-image.svg';">
            </div>
          `).join('')}
        </div>
      </div>
    `
    : `
      <div class="state-box" style="margin-bottom:24px; padding:30px;">
        <i class="fas fa-image state-icon" style="font-size:2rem;"></i>
        <p>Project screenshots will be added soon.</p>
      </div>
    `;

  container.innerHTML = `
    <div class="modal-project-header">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <span class="badge ${project.status === 'Completed' ? 'badge-green' : 'badge-amber'}">${project.status}</span>
        <span class="badge"><i class="fas fa-calendar"></i> ${project.year}</span>
        <span class="badge"><i class="fas fa-folder"></i> ${project.type}</span>
      </div>
      <h2 class="modal-project-title">${project.title}</h2>
      <p style="color:var(--text-accent); font-weight:500;">${project.subtitle || ''}</p>
    </div>

    ${screenshotsHtml}

    <div class="modal-section-block">
      <h4><i class="fas fa-align-left"></i> Project Overview</h4>
      <p>${project.description}</p>
    </div>

    <div class="modal-section-block">
      <h4><i class="fas fa-lightbulb"></i> Problem &amp; Objective</h4>
      <p>${project.problem}</p>
    </div>

    <div class="modal-section-block">
      <h4><i class="fas fa-check-circle"></i> Key Features</h4>
      <div class="features-list-grid">
        ${(project.features || []).map(f => `
          <div class="feature-bullet">
            <i class="fas fa-check"></i>
            <span>${f}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="modal-section-block">
      <h4><i class="fas fa-user-check"></i> My Role</h4>
      <p>${project.role}</p>
    </div>

    <div class="modal-section-block">
      <h4><i class="fas fa-cogs"></i> Technical Architecture</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-top:10px;">
        <div style="background:var(--bg-card); padding:12px 16px; border-radius:8px; border:1px solid var(--border-subtle);">
          <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; display:block;">Frontend</span>
          <strong style="font-size:0.92rem; color:var(--text-primary);">${project.techStack?.frontend || 'N/A'}</strong>
        </div>
        <div style="background:var(--bg-card); padding:12px 16px; border-radius:8px; border:1px solid var(--border-subtle);">
          <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; display:block;">Backend</span>
          <strong style="font-size:0.92rem; color:var(--text-primary);">${project.techStack?.backend || 'N/A'}</strong>
        </div>
        <div style="background:var(--bg-card); padding:12px 16px; border-radius:8px; border:1px solid var(--border-subtle);">
          <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; display:block;">Database</span>
          <strong style="font-size:0.92rem; color:var(--text-primary);">${project.techStack?.database || 'N/A'}</strong>
        </div>
      </div>
    </div>

    <div class="modal-links-footer">
      ${project.links?.github 
        ? `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm"><i class="fab fa-github"></i> View GitHub Repository</a>`
        : `<span class="badge"><i class="fab fa-github"></i> Repository: Coming Soon</span>`
      }
      ${project.links?.liveDemo 
        ? `<a href="${project.links.liveDemo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm"><i class="fas fa-external-link-alt"></i> Launch Live Application</a>`
        : `<span class="badge"><i class="fas fa-desktop"></i> Live Demo: ${project.links?.liveDemoText || 'Coming Soon'}</span>`
      }
      ${project.links?.video 
        ? `<a href="${project.links.video}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm"><i class="fas fa-play"></i> Watch Walkthrough Video</a>`
        : `<span class="badge"><i class="fas fa-video"></i> Video: Coming Soon</span>`
      }
      <span class="badge"><i class="fas fa-file-alt"></i> Documentation: Coming Soon</span>
      <span class="badge"><i class="fas fa-chalkboard-teacher"></i> Presentation: Coming Soon</span>
    </div>
  `;

  // Store modal screenshots for lightbox access
  window.currentModalProjectScreenshots = screenshots.length > 0 
    ? screenshots.map(s => ({ src: s.src, caption: `${project.title} — ${s.caption || ''}` }))
    : [{ src: primaryCover, caption: project.title }];

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.switchModalImage = function(src, index, thumbEl) {
  const mainImg = document.getElementById('modal-active-img');
  if (mainImg) mainImg.src = src;

  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
};

window.openLightboxFromModal = function(index) {
  if (window.openLightbox && window.currentModalProjectScreenshots) {
    window.openLightbox(window.currentModalProjectScreenshots, index);
  }
};
