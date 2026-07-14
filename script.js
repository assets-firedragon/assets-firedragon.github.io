(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  if (!navLinks.length) {
    return;
  }

  const setActiveLink = () => {
    const currentHash = window.location.hash || '#home';

    navLinks.forEach((link) => {
      if (link.getAttribute('href') === currentHash) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  window.addEventListener('hashchange', setActiveLink);
  setActiveLink();
})();
