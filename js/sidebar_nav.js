function cleanSidebarLabel(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function getSidebarSources() {
  const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
  if (navButtons.length) {
    return navButtons.map((button) => ({
      label: cleanSidebarLabel(button.textContent),
      element: button,
      isActive: () => button.classList.contains('active')
    }));
  }

  const topicCards = Array.from(document.querySelectorAll('.topic-card'));
  return topicCards.map((button) => {
    const title = button.querySelector('h3')?.textContent || button.textContent;
    return {
      label: cleanSidebarLabel(title),
      element: button,
      isActive: () => button.classList.contains('active')
    };
  });
}

function createSidebarNav() {
  const sources = getSidebarSources();
  if (sources.length < 2) return;

  const sidebar = document.createElement('aside');
  sidebar.className = 'side-index';
  sidebar.setAttribute('aria-label', 'Indice lateral');
  sidebar.innerHTML = `
    <div class="side-index-title">Indice</div>
    <div class="side-index-list"></div>
  `;

  const list = sidebar.querySelector('.side-index-list');
  const links = sources.map((source) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'side-index-link';
    button.textContent = source.label;
    button.addEventListener('click', () => {
      source.element.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    list.appendChild(button);
    return { button, source };
  });

  function syncActive() {
    links.forEach(({ button, source }) => {
      button.classList.toggle('active', source.isActive());
    });
  }

  const observer = new MutationObserver(syncActive);
  sources.forEach((source) => {
    observer.observe(source.element, { attributes: true, attributeFilter: ['class'] });
  });

  document.body.appendChild(sidebar);
  syncActive();
}

createSidebarNav();
