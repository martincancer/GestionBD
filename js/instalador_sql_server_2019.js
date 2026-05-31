function showTab(name, index) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));

  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[index].classList.add('active');

  const percent = Math.round(((index + 1) / 5) * 100);
  document.getElementById('progress').style.width = percent + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyCode(button) {
  const pre = button.closest('.code-wrapper').querySelector('pre');
  navigator.clipboard.writeText(pre.innerText).then(() => {
    button.textContent = '✓ Copiado';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = 'Copiar';
      button.classList.remove('copied');
    }, 2000);
  });
}
