(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav-links');
  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
    };
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const clock = document.querySelector('#concept-clock');
  const clockTitle = document.querySelector('.console-title-row h3');
  const formatTime = () => {
    const now = new Date();
    if (clock) clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(now);
    if (clockTitle) {
      const hour = now.getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      clockTitle.firstChild.textContent = greeting + ' ';
    }
  };
  formatTime();
  window.setInterval(formatTime, 30000);
})();
