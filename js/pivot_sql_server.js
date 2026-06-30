function showTab(name, idx) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  const pct = Math.round(((idx + 1) / 5) * 100);
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

function pivotGo(n) {
  document.querySelectorAll('.pivot-interactive .panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === n);
  });
  document.querySelectorAll('.pivot-interactive .step-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === n);
  });
}

const questions = [
  {
    q: '¿Cuántas columnas debe devolver la subconsulta interna (T) para un PIVOT estático?',
    opts: [
      'Una sola columna',
      'Exactamente tres',
      'Todas las que quieras',
      'Dos como mínimo'
    ],
    correct: 1,
    feedback: 'Correcto. Necesitás la columna de agrupación, la que se pivotea y el valor a agregar.',
    feedbackErr: 'No. El PIVOT requiere exactamente tres columnas en la subconsulta T.'
  },
  {
    q: '¿Para qué sirve la cláusula FOR ... IN en un PIVOT?',
    opts: [
      'Filtrar filas con WHERE',
      'Indicar qué columna girar y qué valores se convierten en columnas',
      'Ordenar el resultado final',
      'Crear la tabla temporal T'
    ],
    correct: 1,
    feedback: 'Exacto. FOR indica la columna cuyos valores pasan a ser encabezados de columna.',
    feedbackErr: 'Incorrecto. FOR ... IN define la columna a pivotear y la lista de valores.'
  },
  {
    q: '¿Por qué los años en el IN se escriben como [2018], [2019], etc.?',
    opts: [
      'Porque son parámetros de un procedimiento',
      'Porque SQL Server no acepta números como nombres de columna sin corchetes',
      'Porque indican que son opcionales',
      'Porque son índices de array'
    ],
    correct: 1,
    feedback: 'Bien. Los corchetes marcan identificadores delimitados cuando el nombre es numérico.',
    feedbackErr: 'No. Sin [ ] el motor interpretaría el número como valor, no como nombre de columna.'
  },
  {
    q: 'Si un cliente no tuvo ventas en un año listado en el IN, ¿qué valor aparece en esa celda?',
    opts: [
      '0 automáticamente',
      'Una fila vacía',
      'NULL',
      'Error de ejecución'
    ],
    correct: 2,
    feedback: 'Correcto. La ausencia de datos produce NULL; podés reemplazarlo con ISNULL si lo necesitás.',
    feedbackErr: 'No. Sin ventas en ese año la celda queda en NULL, no en cero.'
  },
  {
    q: '¿Cuál es la limitación principal del PIVOT estático mostrado en clase?',
    opts: [
      'No permite SUM como función de agregación',
      'No funciona con JOINs en la subconsulta T',
      'Los valores del IN deben estar escritos a mano; un año nuevo no aparece solo',
      'Solo puede pivotear columnas de tipo texto'
    ],
    correct: 2,
    feedback: 'Muy bien. Para columnas dinámicas hace falta SQL dinámico con EXEC o sp_executesql.',
    feedbackErr: 'Incorrecto. La lista del IN es fija; no se adapta sola a nuevos años.'
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

    container.innerHTML += `
      <div class="quiz-card" id="qcard-${qIndex}">
        <div class="quiz-q">
          <span class="q-num">Pregunta ${qIndex + 1} / ${questions.length}</span>
          ${question.q}
        </div>
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
    'Repasá la explicación interactiva y volvé a intentarlo.',
    'Buen intento, seguí practicando.',
    'Bien, ya entendés la idea general.',
    'Muy bien, tenés una base sólida.',
    'Excelente, dominás bastante bien el tema.'
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
