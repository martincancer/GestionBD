// ── TABS ──────────────────────────────────
function showTab(name, idx) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  const pct = Math.round((idx + 1) / 6 * 100);
  document.getElementById('progress').style.width = pct + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── COPY ─────────────────────────────────
function copyCode(btn) {
  const pre = btn.closest('.code-wrapper').querySelector('pre');
  const text = pre.innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
  });
}

// ── QUIZ ─────────────────────────────────
const questions = [
  {
    q: "¿Qué devuelve este código si la tabla Departamentos tiene un registro con IdDepartamento = NULL?",
    code: `SELECT Nombre FROM Empleados\nWHERE IdDepartamento NOT IN (\n    SELECT IdDepartamento FROM Departamentos\n);`,
    opts: [
      "Devuelve los empleados cuyo IdDepartamento no está en la tabla Departamentos",
      "Lanza un error de sintaxis",
      "Devuelve 0 filas, aunque haya empleados que no coincidan",
      "Ignora los NULLs y funciona normalmente"
    ],
    correct: 2,
    feedback: "Correcto. NOT IN con NULLs devuelve siempre 0 filas porque la comparación con NULL produce UNKNOWN, no TRUE. La solución es usar NOT EXISTS.",
    feedbackErr: "No es correcto. NOT IN con una lista que contiene NULL devuelve 0 filas siempre, porque ninguna comparación contra NULL puede ser TRUE en SQL."
  },
  {
    q: "¿Cuál es la principal diferencia entre una subconsulta simple y una subconsulta correlacionada?",
    code: null,
    opts: [
      "La correlacionada va en el FROM, la simple va en el WHERE",
      "La correlacionada referencia columnas de la consulta exterior y se ejecuta una vez por fila",
      "La correlacionada solo puede usarse con EXISTS",
      "No hay diferencia real, son sinónimos"
    ],
    correct: 1,
    feedback: "Exacto. La subconsulta correlacionada tiene una referencia a la consulta exterior (generalmente mediante un alias), lo que hace que se ejecute una vez por cada fila evaluada.",
    feedbackErr: "Incorrecto. La diferencia clave es que la subconsulta correlacionada hace referencia a columnas de la consulta exterior, por eso se ejecuta una vez por cada fila."
  },
  {
    q: "¿Por qué EXISTS suele ser más eficiente que IN para subconsultas grandes?",
    code: null,
    opts: [
      "EXISTS no permite NULLs, lo que simplifica el plan de ejecución",
      "EXISTS solo puede usarse con índices, lo que lo hace más rápido",
      "EXISTS corta la ejecución en cuanto encuentra la primera fila que cumple la condición",
      "EXISTS no genera una tabla temporal, a diferencia de IN"
    ],
    correct: 2,
    feedback: "Correcto. EXISTS usa short-circuit evaluation: en cuanto encuentra una fila que satisface la condición, retorna TRUE sin seguir buscando. IN en cambio genera la lista completa antes de comparar.",
    feedbackErr: "No exactamente. La razón principal es que EXISTS tiene short-circuit evaluation: para en cuanto encuentra el primer match, sin evaluar el resto."
  },
  {
    q: "¿Qué error produce este código en SQL Server?",
    code: `SELECT Nombre FROM Empleados\nWHERE Sueldo = (\n    SELECT Sueldo FROM Empleados\n    WHERE IdDepartamento = 3\n);`,
    opts: [
      "Error de tipo de dato: Sueldo no es comparable con una subconsulta",
      "Error de sintaxis: falta un alias en la subconsulta",
      "Error en tiempo de ejecución si la subconsulta devuelve más de una fila",
      "Ninguno, funciona perfectamente siempre"
    ],
    correct: 2,
    feedback: "Correcto. Cuando usás = con una subconsulta, SQL Server espera exactamente 1 fila. Si la subconsulta devuelve múltiples filas, lanza: 'Subquery returned more than 1 value'.",
    feedbackErr: "Incorrecto. El problema es que la subconsulta podría devolver múltiples filas, lo que es incompatible con el operador = que espera exactamente 1 valor escalar."
  },
  {
    q: "Una subconsulta en la cláusula FROM siempre requiere:",
    code: `SELECT dep, promedio FROM (\n    SELECT IdDept AS dep, AVG(Sueldo) AS promedio\n    FROM Empleados GROUP BY IdDept\n) _____ -- ¿qué va acá?`,
    opts: [
      "Un índice en la tabla base",
      "Un alias (nombre) obligatorio",
      "La palabra clave SUBQUERY",
      "Un ORDER BY interno"
    ],
    correct: 1,
    feedback: "Correcto. Las tablas derivadas (subconsultas en FROM) necesitan obligatoriamente un alias. Sin él, SQL Server retorna un error de sintaxis.",
    feedbackErr: "Incorrecto. Una subconsulta en FROM (tabla derivada) siempre necesita un alias. Es una regla de sintaxis obligatoria en SQL Server."
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
    const codeBlock = q.code
      ? `<div class="quiz-code">${q.code.replace(/SELECT/g,'<span class="kw">SELECT</span>').replace(/FROM/g,'<span class="kw">FROM</span>').replace(/WHERE/g,'<span class="kw">WHERE</span>').replace(/NOT IN/g,'<span class="kw">NOT IN</span>').replace(/NULL/g,'<span class="nm">NULL</span>')}</div>`
      : '';
    c.innerHTML += `
      <div class="quiz-card" id="qcard-${qi}">
        <div class="quiz-q">
          <span class="q-num">Pregunta ${qi+1} / ${questions.length}</span>
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
    'Bien! Estás en el buen camino.',
    'Muy bien! Dominás el tema.',
    '¡Excelente! Perfecto.'
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
