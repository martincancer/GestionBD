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
    q: '¿Qué palabra clave identifica un parámetro de salida en un procedimiento almacenado?',
    opts: [
      'RETURN',
      'OUTPUT',
      'OUT',
      'SELECT'
    ],
    correct: 1,
    feedback: 'Correcto. Se declara con OUTPUT al final del parámetro.',
    feedbackErr: 'No. En T-SQL la palabra clave es OUTPUT, no OUT ni RETURN.'
  },
  {
    q: '¿Qué hace SET @resultado = (@n1 + @n2) / 2 dentro del procedimiento?',
    opts: [
      'Devuelve un conjunto de filas al cliente',
      'Asigna el valor calculado al parámetro de salida',
      'Crea una tabla temporal',
      'Ejecuta el procedimiento automáticamente'
    ],
    correct: 1,
    feedback: 'Exacto. Dentro del procedimiento se asigna el valor que luego recuperará quien lo ejecute.',
    feedbackErr: 'Incorrecto. Esa línea carga el parámetro de salida con el resultado del cálculo.'
  },
  {
    q: 'Antes de ejecutar un procedimiento con parámetro de salida, ¿qué debés declarar?',
    opts: [
      'Una tabla temporal',
      'Un cursor',
      'Una variable para recibir el valor retornado',
      'Un trigger'
    ],
    correct: 2,
    feedback: 'Bien. La variable recibe el valor cuando pasás el parámetro OUTPUT en el EXEC.',
    feedbackErr: 'No. Siempre se declara una variable que luego se pasa como parámetro de salida.'
  },
  {
    q: 'En SP_GetCotizacion, ¿cómo se obtiene la cotización desde la tabla?',
    opts: [
      'INSERT INTO @cotizacion SELECT cotizacion ...',
      'SELECT @cotizacion = cotizacion FROM MonedasCotizaciones WHERE ...',
      'PRINT cotizacion FROM MonedasCotizaciones',
      'RETURN cotizacion'
    ],
    correct: 1,
    feedback: 'Correcto. Se asigna el valor de la columna al parámetro de salida con SELECT @variable = columna.',
    feedbackErr: 'No. La forma habitual es SELECT @parametroSalida = columna FROM tabla WHERE ...'
  },
  {
    q: '¿Cuál de estas formas permite mostrar el valor devuelto por el procedimiento?',
    opts: [
      'Solo con RETURN',
      'Solo con UPDATE',
      'Con SELECT @variable o con PRINT @variable',
      'Con DEALLOCATE @variable'
    ],
    correct: 2,
    feedback: 'Muy bien. Podés ver el resultado con SELECT o con PRINT sobre la variable de salida.',
    feedbackErr: 'Incorrecto. Una vez ejecutado el procedimiento, el valor queda en la variable y se muestra con SELECT o PRINT.'
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
    'Repasá la estructura OUTPUT y volvé a intentarlo.',
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
