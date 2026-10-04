/**
 * AFHAM AHAMED — CONTACT SYSTEM CONTROLLER
 * Features: Client-side validation, honeypot spam protection, AJAX submission, accessible alerts
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  const alertBox = document.getElementById('form-alert-message');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset previous alerts
    hideAlert(alertBox);

    // 1. Gather values
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const subject = form.querySelector('[name="subject"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    const honeypot = form.querySelector('[name="website_hp"]')?.value || '';

    // 2. Client-side Validation
    if (honeypot !== '') {
      // Bot detected, silently show success
      showAlert(alertBox, 'Thank you! Your message has been sent successfully.', 'success');
      form.reset();
      return;
    }

    if (name.length < 2) {
      showAlert(alertBox, 'Please enter your full name.', 'error');
      form.querySelector('[name="name"]').focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(alertBox, 'Please provide a valid email address.', 'error');
      form.querySelector('[name="email"]').focus();
      return;
    }

    if (subject.length < 3) {
      showAlert(alertBox, 'Please enter a valid subject (at least 3 characters).', 'error');
      form.querySelector('[name="subject"]').focus();
      return;
    }

    if (message.length < 10) {
      showAlert(alertBox, 'Please enter your message (at least 10 characters).', 'error');
      form.querySelector('[name="message"]').focus();
      return;
    }

    // 3. UI Loading State
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner spin-anim"></i> Sending message...';

    // 4. AJAX Dispatch
    try {
      const payload = {
        name,
        email,
        phone,
        subject,
        message,
        website_hp: honeypot
      };

      const res = await fetch('backend/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        showAlert(alertBox, data.message || 'Thank you! Your message has been sent successfully.', 'success');
        form.reset();
      } else {
        const errorMsg = data?.message || 'Unable to send message. Please try again.';
        showAlert(alertBox, errorMsg, 'error');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      // Fallback if backend cannot be reached (e.g. static hosting on GitHub Pages)
      showAlert(
        alertBox, 
        'Unable to connect to the mail backend directly right now. You can also reach me instantly via WhatsApp or direct email below.', 
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

function showAlert(el, msg, type) {
  if (!el) return;
  el.className = `form-alert alert-${type}`;
  const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
  el.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
  el.style.display = 'flex';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert(el) {
  if (!el) return;
  el.style.display = 'none';
  el.className = 'form-alert';
}
