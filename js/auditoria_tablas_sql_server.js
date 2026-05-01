function showTab(name, idx) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  const pct = Math.round(((idx + 1) / 6) * 100);
  document.getElementById('progress').style.width = pct + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyCode(btn) {
  const pre = btn.closest('.code-wrapper').querySelector('pre');
  const text = pre.innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copiar';
      btn.classList.remove('copied');
    }, 2000);
  });
}

const questions = [
  {
    q: '¿Qué información NO es obligatoria según el diseño mínimo de una tabla de auditoría?',
    code: null,
    opts: [
      'Usuario que realizó el cambio',
      'Fecha y hora del cambio',
      'Nombre del servidor SQL',
      'Tipo de operación realizada'
    ],
    correct: 2,
    feedback: 'Correcto. El nombre del servidor puede ser útil, pero no forma parte del diseño mínimo planteado en el material.',
    feedbackErr: 'No. El diseño mínimo sí necesita saber quién cambió, cuándo cambió y qué operación ocurrió.'
  },
  {
    q: '¿Cuál es la principal ventaja de guardar tanto el valor anterior como el valor nuevo?',
    code: null,
    opts: [
      'Reduce el tamaño de la base de datos',
      'Permite reconstruir el historial completo de cambios',
      'Evita la ejecución de triggers adicionales',
      'Acelera las consultas SELECT'
    ],
    correct: 1,
    feedback: 'Exacto. Comparar antes y después es lo que vuelve realmente útil a una auditoría.',
    feedbackErr: 'Incorrecto. La razón principal es poder reconstruir qué cambió y cómo evolucionó el dato.'
  },
  {
    q: 'Si querés registrar desde qué aplicación se hizo el cambio, ¿qué función conviene usar?',
    code: null,
    opts: [
      'SYSTEM_USER',
      'HOST_NAME()',
      'APP_NAME()',
      '@@SERVERNAME'
    ],
    correct: 2,
    feedback: 'Correcto. APP_NAME() devuelve el nombre de la aplicación cliente que originó la sesión.',
    feedbackErr: 'No. SYSTEM_USER identifica usuario, HOST_NAME() el equipo y @@SERVERNAME la instancia; la aplicación viene con APP_NAME().'
  },
  {
    q: 'En un DELETE, ¿de dónde salen los valores del registro eliminado?',
    code: null,
    opts: [
      'De la tabla original',
      'De inserted',
      'De deleted',
      'De la tabla de auditoría'
    ],
    correct: 2,
    feedback: 'Bien. En una eliminación, la pseudotabla deleted conserva los valores que acaban de salir de la tabla.',
    feedbackErr: 'Incorrecto. Para DELETE, la referencia correcta es la pseudotabla deleted.'
  },
  {
    q: '¿Cuál es el objetivo principal de usar triggers para auditoría?',
    code: null,
    opts: [
      'Mejorar el rendimiento de las consultas',
      'Registrar automáticamente los cambios en los datos',
      'Evitar cualquier modificación en la base',
      'Reemplazar las claves primarias'
    ],
    correct: 1,
    feedback: 'Correcto. El valor del trigger está en capturar el cambio en el momento en que ocurre.',
    feedbackErr: 'No. La auditoría con triggers busca registrar cambios de forma automática, no bloquear toda modificación.'
  }
];

let answered = [];
let score = 0;

function buildQuiz() {
  answered = new Array(questions.length).fill(false);
  score = 0;
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  questions.forEach((question, qIndex) => {
    const letters = ['A', 'B', 'C', 'D'];
    const optionsHtml = question.opts.map((option, optionIndex) =>
      `<button class="option" onclick="answer(${qIndex},${optionIndex})" id="opt-${qIndex}-${optionIndex}">
         <span class="opt-letter">${letters[optionIndex]}</span>${option}
       </button>`
    ).join('');

    const codeBlock = question.code ? `<div class="quiz-code">${question.code}</div>` : '';

    container.innerHTML += `
      <div class="quiz-card" id="qcard-${qIndex}">
        <div class="quiz-q">
          <span class="q-num">Pregunta ${qIndex + 1} / ${questions.length}</span>
          ${question.q}
        </div>
        ${codeBlock}
        <div class="options">${optionsHtml}</div>
        <div class="feedback" id="fb-${qIndex}"></div>
      </div>`;
  });
}

function answer(qIndex, optionIndex) {
  if (answered[qIndex]) return;

  answered[qIndex] = true;
  const question = questions[qIndex];
  const options = document.querySelectorAll(`[id^="opt-${qIndex}-"]`);
  options.forEach(option => option.disabled = true);

  const chosen = document.getElementById(`opt-${qIndex}-${optionIndex}`);
  const feedback = document.getElementById(`fb-${qIndex}`);

  if (optionIndex === question.correct) {
    score++;
    chosen.classList.add('correct');
    feedback.textContent = '✓ ' + question.feedback;
    feedback.className = 'feedback show ok';
  } else {
    chosen.classList.add('wrong');
    document.getElementById(`opt-${qIndex}-${question.correct}`).classList.add('correct');
    feedback.textContent = '✗ ' + question.feedbackErr;
    feedback.className = 'feedback show err';
  }

  if (answered.every(Boolean)) {
    setTimeout(showScore, 600);
  }
}

function showScore() {
  const pct = Math.round((score / questions.length) * 100);
  const messages = [
    'Repasá el material y volvé a intentarlo.',
    'Buen intento, seguí practicando.',
    'Bien, ya entendés la idea general.',
    'Muy bien, tenés una base sólida.',
    'Excelente, dominás muy bien la lógica de auditoría.'
  ];
  const idx = Math.floor(pct / 25);

  document.getElementById('score-val').textContent = `${score}/${questions.length}`;
  document.getElementById('score-msg').textContent = `${pct}% — ${messages[Math.min(idx, 4)]}`;
  document.getElementById('score-val').style.color =
    pct >= 80 ? 'var(--green)' :
    pct >= 60 ? 'var(--amber)' :
    'var(--accent)';

  document.getElementById('quiz-score').style.display = 'block';
  document.getElementById('quiz-score').scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
  document.getElementById('quiz-score').style.display = 'none';
  buildQuiz();
  document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' });
}

buildQuiz();
