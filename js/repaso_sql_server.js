function showTopic(topicId) {
  const cards = document.querySelectorAll('.topic-card');
  const sections = document.querySelectorAll('.topic-detail');
  const selectedSection = document.getElementById(`topic-${topicId}`);
  const detailHeading = document.getElementById('detail-heading');

  cards.forEach(card => {
    card.classList.toggle('active', card.dataset.topic === topicId);
  });

  sections.forEach(section => {
    section.classList.toggle('active', section.id === `topic-${topicId}`);
  });

  if (selectedSection) {
    detailHeading.textContent = selectedSection.dataset.title;
    document.getElementById('detalle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function copyCode(button) {
  const code = button.closest('.code-wrapper').querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const original = button.textContent;
    button.textContent = 'Copiado';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = original;
      button.classList.remove('copied');
    }, 1200);
  });
}
