/**
 * AFHAM AHAMED — RESPONSIVE LIGHTBOX GALLERY SYSTEM
 * Features: Keyboard navigation, swipe gestures, counter, fullscreen
 */

let activeGalleryImages = [];
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
});

function initLightbox() {
  const overlay = document.getElementById('lightbox-modal');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const closeBtn = document.getElementById('lightbox-close');

  if (!overlay) return;

  if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
  if (nextBtn) nextBtn.addEventListener('click', showNextImage);
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevImage();
    if (e.key === 'ArrowRight') showNextImage();
  });

  // Touch Swipe for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;

  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  overlay.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        showPrevImage();
      } else {
        showNextImage();
      }
    }
  }
}

window.openLightbox = function(imagesArray, startIndex = 0) {
  if (!imagesArray || imagesArray.length === 0) return;

  activeGalleryImages = imagesArray;
  currentImageIndex = startIndex;

  const overlay = document.getElementById('lightbox-modal');
  if (overlay) {
    updateLightboxView();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

function closeLightbox() {
  const overlay = document.getElementById('lightbox-modal');
  if (overlay) {
    overlay.classList.remove('active');
    // Only re-enable scrolling if project modal is NOT also active
    const projectModal = document.getElementById('project-modal');
    if (!projectModal || !projectModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }
}

function showPrevImage() {
  if (activeGalleryImages.length <= 1) return;
  currentImageIndex = (currentImageIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length;
  updateLightboxView();
}

function showNextImage() {
  if (activeGalleryImages.length <= 1) return;
  currentImageIndex = (currentImageIndex + 1) % activeGalleryImages.length;
  updateLightboxView();
}

function updateLightboxView() {
  const imgEl = document.getElementById('lightbox-image');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');

  if (!imgEl) return;

  const currentItem = activeGalleryImages[currentImageIndex];
  const src = typeof currentItem === 'string' ? currentItem : currentItem.src;
  const caption = typeof currentItem === 'string' ? 'Project Preview' : (currentItem.caption || 'Project Preview');

  imgEl.src = src;
  imgEl.alt = caption;
  imgEl.onerror = function() {
    this.onerror = null;
    this.src = 'assets/images/placeholder-image.svg';
  };

  if (captionEl) captionEl.textContent = caption;
  if (counterEl) {
    counterEl.textContent = `${currentImageIndex + 1} / ${activeGalleryImages.length}`;
  }
}
