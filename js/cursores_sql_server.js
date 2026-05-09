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
    q: '¿Qué describe mejor a un cursor en SQL Server?',
    opts: [
      'Una tabla temporal creada automáticamente',
      'Un objeto para procesar resultados fila por fila',
      'Un índice que acelera consultas',
      'Una función que devuelve varias filas'
    ],
    correct: 1,
    feedback: 'Correcto. El cursor permite recorrer el resultado de una consulta fila por fila.',
    feedbackErr: 'No. La idea central del cursor es el procesamiento secuencial, no la optimización ni la creación de tablas temporales.'
  },
  {
    q: '¿En qué escenario tiene más sentido usar un cursor?',
    opts: [
      'Cuando un JOIN o un UPDATE masivo resuelven el problema fácilmente',
      'En operaciones frecuentes de alto volumen',
      'Cuando cada fila necesita una lógica condicional particular',
      'Para reemplazar cualquier SELECT normal'
    ],
    correct: 2,
    feedback: 'Exacto. El cursor tiene sentido cuando la lógica por fila es realmente necesaria.',
    feedbackErr: 'Incorrecto. Si el problema se resuelve bien con conjuntos, el cursor normalmente no es la mejor opción.'
  },
  {
    q: '¿Qué instrucción deja listo al cursor para empezar a recorrer filas?',
    opts: [
      'FETCH NEXT',
      'OPEN',
      'DECLARE',
      'DEALLOCATE'
    ],
    correct: 1,
    feedback: 'Bien. OPEN inicializa el cursor y prepara el conjunto de resultados.',
    feedbackErr: 'No. DECLARE lo define, pero OPEN es lo que lo deja listo para empezar a usar.'
  },
  {
    q: '¿Qué verifica habitualmente la condición @@FETCH_STATUS = 0?',
    opts: [
      'Que el cursor fue borrado correctamente',
      'Que la última fila fue actualizada',
      'Que el último FETCH obtuvo una fila válida',
      'Que el cursor tiene exactamente una fila'
    ],
    correct: 2,
    feedback: 'Correcto. @@FETCH_STATUS = 0 indica que el FETCH recuperó una fila válida.',
    feedbackErr: 'Incorrecto. Esa variable de sistema se usa para saber si el FETCH pudo traer otra fila.'
  },
  {
    q: '¿Qué par de instrucciones se usa al final para cerrar y liberar un cursor?',
    opts: [
      'UPDATE y DELETE',
      'FETCH y WHILE',
      'OPEN y FETCH',
      'CLOSE y DEALLOCATE'
    ],
    correct: 3,
    feedback: 'Correcto. CLOSE cierra el cursor y DEALLOCATE libera sus recursos.',
    feedbackErr: 'No. El cierre correcto del ciclo del cursor termina con CLOSE y DEALLOCATE.'
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
    'Repasá el ciclo del cursor y volvé a intentarlo.',
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
