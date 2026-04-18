function showTab(name, idx) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  const pct = Math.round((idx + 1) / 6 * 100);
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
    q: '¿Cuál de las siguientes afirmaciones describe mejor un trigger?',
    code: null,
    opts: [
      'Es un procedimiento que se ejecuta manualmente desde la aplicación',
      'Es una función que devuelve un valor escalar automáticamente',
      'Es un procedimiento que se ejecuta automáticamente ante ciertos eventos',
      'Es un índice especial que optimiza consultas'
    ],
    correct: 2,
    feedback: 'Correcto. Un trigger se ejecuta automáticamente cuando ocurre el evento que lo dispara.',
    feedbackErr: 'Incorrecto. La idea central de un trigger es que se dispara solo, sin invocación manual.'
  },
  {
    q: 'En un trigger INSTEAD OF INSERT, ¿qué ocurre con la fila al momento de ejecutarse el trigger?',
    code: null,
    opts: [
      'Ya fue insertada en la tabla',
      'Está en la tabla deleted',
      'Todavía no fue insertada en la tabla',
      'Se inserta automáticamente después del trigger'
    ],
    correct: 2,
    feedback: 'Exacto. En INSTEAD OF el trigger corre antes de que la operación se aplique realmente.',
    feedbackErr: 'No. Justamente la diferencia de INSTEAD OF es que reemplaza la operación original.'
  },
  {
    q: 'En una operación UPDATE, ¿qué contienen las tablas inserted y deleted?',
    code: null,
    opts: [
      'inserted: valores anteriores / deleted: valores nuevos',
      'inserted: valores nuevos / deleted: valores anteriores',
      'Ambas contienen los mismos datos',
      'Solo se utiliza la tabla inserted'
    ],
    correct: 1,
    feedback: 'Correcto. inserted guarda el estado nuevo y deleted el estado previo.',
    feedbackErr: 'Incorrecto. En UPDATE se puede comparar antes y después justamente por esa diferencia.'
  },
  {
    q: '¿Qué sucede si un trigger ejecuta un ROLLBACK TRANSACTION?',
    code: null,
    opts: [
      'Solo se cancela el código del trigger',
      'Se cancela únicamente la última consulta del trigger',
      'Se cancela toda la transacción, incluyendo la operación original',
      'No tiene efecto si es un trigger AFTER'
    ],
    correct: 2,
    feedback: 'Correcto. El trigger forma parte de la misma transacción que disparó el evento.',
    feedbackErr: 'No es así. Un ROLLBACK dentro del trigger deshace también la operación original.'
  },
  {
    q: '¿Cuál es una desventaja común de los triggers?',
    code: null,
    opts: [
      'No pueden trabajar con múltiples filas',
      'No se ejecutan automáticamente',
      'Pueden afectar el rendimiento si contienen lógica compleja',
      'No permiten validaciones de datos'
    ],
    correct: 2,
    feedback: 'Correcto. Si el trigger hace trabajo costoso o se ejecuta muy seguido, el impacto puede ser importante.',
    feedbackErr: 'Incorrecto. Los triggers sí permiten validaciones y sí se ejecutan automáticamente; el problema más frecuente es el rendimiento.'
  }
];

let answered = [];
let score = 0;

function buildQuiz() {
  answered = new Array(questions.length).fill(false);
  score = 0;
  const c = document.getElementById('quiz-container');
  c.innerHTML = '';
  questions.forEach((q, qi) => {
    const letters = ['A','B','C','D'];
    const optsHtml = q.opts.map((o, oi) =>
      `<button class="option" onclick="answer(${qi},${oi})" id="opt-${qi}-${oi}">
         <span class="opt-letter">${letters[oi]}</span>${o}
       </button>`
    ).join('');
    const codeBlock = q.code ? `<div class="quiz-code">${q.code}</div>` : '';
    c.innerHTML += `
      <div class="quiz-card" id="qcard-${qi}">
        <div class="quiz-q">
          <span class="q-num">Pregunta ${qi + 1} / ${questions.length}</span>
          ${q.q}
        </div>
        ${codeBlock}
        <div class="options">${optsHtml}</div>
        <div class="feedback" id="fb-${qi}"></div>
      </div>`;
  });
}

function answer(qi, oi) {
  if (answered[qi]) return;
  answered[qi] = true;
  const q = questions[qi];
  const opts = document.querySelectorAll(`[id^="opt-${qi}-"]`);
  opts.forEach(o => o.disabled = true);
  const chosen = document.getElementById(`opt-${qi}-${oi}`);
  const fb = document.getElementById(`fb-${qi}`);

  if (oi === q.correct) {
    score++;
    chosen.classList.add('correct');
    fb.textContent = '✓ ' + q.feedback;
    fb.className = 'feedback show ok';
  } else {
    chosen.classList.add('wrong');
    document.getElementById(`opt-${qi}-${q.correct}`).classList.add('correct');
    fb.textContent = '✗ ' + q.feedbackErr;
    fb.className = 'feedback show err';
  }

  if (answered.every(Boolean)) {
    setTimeout(showScore, 600);
  }
}

function showScore() {
  const pct = Math.round(score / questions.length * 100);
  const msgs = [
    'Repasá el material nuevamente.',
    'Buen intento, seguí practicando.',
    'Bien, ya entendés la idea general.',
    'Muy bien, dominás bastante el tema.',
    'Excelente, comprensión muy sólida.'
  ];
  const idx = Math.floor(pct / 25);
  document.getElementById('score-val').textContent = `${score}/${questions.length}`;
  document.getElementById('score-msg').textContent = `${pct}% — ${msgs[Math.min(idx, 4)]}`;
  document.getElementById('score-val').style.color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--amber)' : 'var(--coral)';
  document.getElementById('quiz-score').style.display = 'block';
  document.getElementById('quiz-score').scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
  document.getElementById('quiz-score').style.display = 'none';
  buildQuiz();
  document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' });
}

buildQuiz();
