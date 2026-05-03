const searchInput = document.querySelector('#site-search');
const searchCount = document.querySelector('#search-count');
const searchableItems = Array.from(document.querySelectorAll('.portal-card, .lesson-card, .ref-card, .soon-card'));

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function updateSearch() {
  if (!searchInput) return;

  const query = normalizeText(searchInput.value.trim());
  let visibleCount = 0;

  searchableItems.forEach((item) => {
    const haystack = normalizeText(item.textContent);
    const isVisible = query === '' || haystack.includes(query);
    item.classList.toggle('is-hidden-by-search', !isVisible);
    if (isVisible) visibleCount += 1;
  });

  if (searchCount) {
    searchCount.textContent = query === ''
      ? 'Buscá por tema, palabra clave o recurso.'
      : `${visibleCount} resultado${visibleCount === 1 ? '' : 's'} encontrado${visibleCount === 1 ? '' : 's'}.`;
  }
}

searchInput?.addEventListener('input', updateSearch);
