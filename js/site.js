/* ===================================================================
   site.js — header, menus, menu-page tabs, job application dialog
   =================================================================== */

// ---- Header shadow once the page scrolls ----
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---- Desktop "Menu" dropdown (click, keyboard, outside click, Escape) ----
document.querySelectorAll('[data-dropdown]').forEach((btn) => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(btn.getAttribute('aria-expanded') !== 'true');
  });
  btn.parentElement.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setOpen(false); btn.focus(); }
  });
  btn.parentElement.addEventListener('focusout', (e) => {
    if (!btn.parentElement.contains(e.relatedTarget)) setOpen(false);
  });
  document.addEventListener('click', () => setOpen(false));
});

// ---- Mobile navigation ----
const toggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function setMobile(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}
toggle.addEventListener('click', () => setMobile(toggle.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMobile(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !mobileNav.hidden) { setMobile(false); toggle.focus(); }
});
window.matchMedia('(min-width: 1061px)').addEventListener('change', (e) => { if (e.matches) setMobile(false); });

// ---- Menu pages: highlight the tab for the section in view ----
const tabs = document.querySelectorAll('.menu-tabs a[href^="#"]');
if (tabs.length) {
  const byId = new Map([...tabs].map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      tabs.forEach((a) => a.classList.remove('is-active'));
      const tab = byId.get(entry.target.id);
      if (tab) {
        tab.classList.add('is-active');
        // Scroll only the tab strip sideways; scrollIntoView would also nudge the page and fight the user's scroll
        const strip = tab.closest('ul');
        const left = tab.offsetLeft - strip.offsetLeft;
        if (left < strip.scrollLeft || left + tab.offsetWidth > strip.scrollLeft + strip.clientWidth) {
          strip.scrollTo({ left: left - 16, behavior: 'smooth' });
        }
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  // Land section titles just below the sticky header + tab bar, not underneath them
  const tabBar = document.querySelector('.menu-tabs');
  const setOffset = () => {
    document.documentElement.style.scrollPaddingTop = `${header.offsetHeight + tabBar.offsetHeight + 16}px`;
  };
  setOffset();
  window.addEventListener('resize', setOffset);

  // Tab clicks land on the section title itself (sections have top padding above their heading)
  tabs.forEach((a) => a.addEventListener('click', (e) => {
    const section = document.getElementById(a.getAttribute('href').slice(1));
    if (!section) return;
    e.preventDefault();
    const title = section.querySelector('h2') || section;
    const top = title.getBoundingClientRect().top + window.scrollY - header.offsetHeight - tabBar.offsetHeight - 24;
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  }));
}

// ---- Job application dialog (native <dialog>: focus trap + Escape built in) ----
const dialog = document.getElementById('job-dialog');
const form = document.getElementById('job-form');
const resume = document.getElementById('resume');
const resumeHint = document.getElementById('resume-hint');
const HINT = 'PDF, DOC or DOCX, up to 15 MB.';

document.querySelectorAll('[data-open-jobs]').forEach((b) => b.addEventListener('click', () => dialog.showModal()));
dialog.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

resume.addEventListener('change', () => {
  const file = resume.files[0];
  if (!file) { resumeHint.textContent = HINT; return; }
  if (file.size > 15 * 1024 * 1024) {
    resume.value = '';
    resume.setCustomValidity('');
    resumeHint.textContent = 'That file is over 15 MB. Please choose a smaller one.';
    return;
  }
  resumeHint.textContent = file.name;
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  alert("Application submitted! We'll be in touch soon.");
  form.reset();
  resumeHint.textContent = HINT;
  dialog.close();
});
