function showTab(name, index) {
  document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((button) => button.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.nav-btn')[index].classList.add('active');
  document.getElementById('progress').style.width = `${Math.round(((index + 1) / 5) * 100)}%`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyCode(button) {
  const text = button.closest('.code-wrapper').querySelector('pre').innerText;
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = '✓ Copiado';
    button.classList.add('copied');
    setTimeout(() => { button.textContent = 'Copiar'; button.classList.remove('copied'); }, 2000);
  });
}

const questions = [
  { q: '¿Qué tipo de backup contiene toda la base de datos y sirve de punto de partida?', opts: ['Diferencial', 'Completo', 'Del log', 'De medios'], correct: 1, ok: 'Correcto. El backup completo contiene toda la base.', err: 'No. El punto de partida es el backup completo.' },
  { q: '¿Qué modelo permite hacer backups del log de transacciones y recuperar hasta un momento específico?', opts: ['SIMPLE', 'COMPLETO', 'Solo lectura', 'Diferencial'], correct: 1, ok: 'Exacto. El modelo COMPLETO permite respaldar el log.', err: 'No. Esa posibilidad requiere el modelo de recuperación COMPLETO.' },
  { q: '¿Qué guarda un backup diferencial?', opts: ['Solo la estructura de las tablas', 'Los cambios desde el último backup completo', 'Todas las transacciones de la última hora', 'Una copia del sistema operativo'], correct: 1, ok: 'Bien. Acumula los cambios desde el último backup completo.', err: 'Incorrecto. El diferencial toma como referencia el último backup completo.' },
  { q: '¿Para qué sirve WITH INIT en BACKUP DATABASE?', opts: ['Comprimir el backup', 'Cifrar el archivo', 'Sobrescribir el archivo de destino si existe', 'Restaurar la base automáticamente'], correct: 2, ok: 'Correcto. INIT inicia un nuevo conjunto y sobrescribe el archivo existente.', err: 'No. INIT controla si se sobrescribe el archivo de backup.' },
  { q: '¿Por qué es recomendable guardar la copia en otra unidad o servidor?', opts: ['Para que SQL Server sea más rápido', 'Para sobrevivir a una falla de la máquina principal', 'Porque un .bak no puede estar en el servidor', 'Para evitar usar el modelo COMPLETO'], correct: 1, ok: 'Muy bien. Separar el backup reduce el riesgo ante una falla del servidor.', err: 'No. La razón principal es conservar una copia ante una falla de la máquina principal.' }
];

let answered = [];
let score = 0;
function buildQuiz() {
  answered = new Array(questions.length).fill(false); score = 0;
  const container = document.getElementById('quiz-container'); container.innerHTML = '';
  questions.forEach((question, questionIndex) => {
    const options = question.opts.map((option, optionIndex) => `<button class="option" onclick="answer(${questionIndex},${optionIndex})" id="opt-${questionIndex}-${optionIndex}"><span class="opt-letter">${'ABCD'[optionIndex]}</span>${option}</button>`).join('');
    container.innerHTML += `<div class="quiz-card"><div class="quiz-q"><span class="q-num">Pregunta ${questionIndex + 1} / ${questions.length}</span>${question.q}</div><div class="options">${options}</div><div class="feedback" id="fb-${questionIndex}"></div></div>`;
  });
}
function answer(questionIndex, optionIndex) {
  if (answered[questionIndex]) return;
  answered[questionIndex] = true; const question = questions[questionIndex];
  document.querySelectorAll(`[id^="opt-${questionIndex}-"]`).forEach((option) => { option.disabled = true; });
  const feedback = document.getElementById(`fb-${questionIndex}`);
  if (optionIndex === question.correct) { score++; document.getElementById(`opt-${questionIndex}-${optionIndex}`).classList.add('correct'); feedback.textContent = `✓ ${question.ok}`; feedback.className = 'feedback show ok'; }
  else { document.getElementById(`opt-${questionIndex}-${optionIndex}`).classList.add('wrong'); document.getElementById(`opt-${questionIndex}-${question.correct}`).classList.add('correct'); feedback.textContent = `✗ ${question.err}`; feedback.className = 'feedback show err'; }
  if (answered.every(Boolean)) setTimeout(showScore, 600);
}
function showScore() {
  const percent = Math.round((score / questions.length) * 100);
  document.getElementById('score-val').textContent = `${score}/${questions.length}`;
  document.getElementById('score-msg').textContent = `${percent}% - ${percent >= 80 ? 'Excelente, dominás las copias de seguridad.' : percent >= 60 ? 'Bien, repasá los conceptos que fallaste.' : 'Volvé a revisar los tipos y modelos de recuperación.'}`;
  document.getElementById('quiz-score').style.display = 'block';
  document.getElementById('quiz-score').scrollIntoView({ behavior: 'smooth' });
}
function resetQuiz() { document.getElementById('quiz-score').style.display = 'none'; buildQuiz(); document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' }); }
buildQuiz();
