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
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
  });
}

// ── DEMO INTERACTIVO ──────────────────────
function getCategoria(sueldo) {
  if (sueldo >= 150000) return { label: 'Premium',  color: '#bc8cff', bg: '#1c1040' };
  if (sueldo >= 100000) return { label: 'Alto',     color: '#f85149', bg: '#2d1116' };
  if (sueldo >=  50000) return { label: 'Medio',    color: '#d29922', bg: '#2b1d0e' };
  return                        { label: 'Básico',  color: '#58a6ff', bg: '#0d1f36' };
}

function updateDemo() {
  const sueldo = parseInt(document.getElementById('sueldo-slider').value);
  document.getElementById('sueldo-val').textContent = sueldo.toLocaleString('es-AR');
  const cat = getCategoria(sueldo);

  const ranges = [
    { label: '>= $150.000 → Premium', min: 150000, cat: 'Premium', color: '#bc8cff', bg: '#1c1040' },
    { label: '>= $100.000 → Alto',    min: 100000, cat: 'Alto',    color: '#f85149', bg: '#2d1116' },
    { label: '>= $50.000 → Medio',    min:  50000, cat: 'Medio',   color: '#d29922', bg: '#2b1d0e' },
    { label: 'ELSE → Básico',         min:       0, cat: 'Básico', color: '#58a6ff', bg: '#0d1f36' },
  ];

  const html = ranges.map(r => {
    const active = r.cat === cat.label;
    return `<div class="result-row" style="${active ? 'background:' + r.bg + ';border-radius:6px;' : ''}">
      <span class="result-val" style="color:${active ? r.color : 'var(--text3)'}">WHEN</span>
      <span class="result-label" style="color:${active ? 'var(--text)' : 'var(--text3)'}">${r.label}</span>
      ${active ? `<span class="result-badge" style="background:${r.bg};color:${r.color};border:1px solid ${r.color}40">← match</span>` : ''}
    </div>`;
  }).join('');

  document.getElementById('demo-result').innerHTML =
    `<div style="font-size:12px;color:var(--text3);margin-bottom:10px;font-family:'JetBrains Mono',monospace">Evaluando Sueldo = $${sueldo.toLocaleString('es-AR')}</div>` + html +
    `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:13px">
       Resultado: <span style="color:${cat.color};font-weight:700">'${cat.label}'</span>
     </div>`;
}

updateDemo();

// ── QUIZ ─────────────────────────────────
const questions = [
  {
    q: "¿Qué devuelve CASE cuando ningún WHEN se cumple y no hay cláusula ELSE?",
    code: null,
    opts: [
      "Lanza un error de ejecución",
      "Devuelve una cadena vacía ''",
      "Devuelve NULL",
      "Devuelve el valor de la primera condición evaluada"
    ],
    correct: 2,
    feedback: "Correcto. Si ningún WHEN coincide y no hay ELSE, CASE devuelve NULL. Por eso se recomienda siempre agregar un ELSE explícito para controlar el valor por defecto.",
    feedbackErr: "Incorrecto. Cuando no hay ELSE y ningún WHEN coincide, CASE devuelve NULL silenciosamente, sin lanzar ningún error."
  },
  {
    q: "¿Cuál es el resultado para un empleado con Sueldo = 80000 con este CASE?",
    code: `CASE
  WHEN Sueldo >= 50000 THEN 'Medio'
  WHEN Sueldo >= 80000 THEN 'Alto'
  ELSE 'Básico'
END`,
    opts: [
      "'Alto'",
      "'Medio'",
      "'Básico'",
      "NULL"
    ],
    correct: 1,
    feedback: "Correcto. Aunque 80000 >= 80000 es verdadero para el segundo WHEN, SQL Server ya matcheó el primer WHEN (80000 >= 50000 también es verdadero) y devolvió 'Medio'. El orden importa: el primer WHEN verdadero gana.",
    feedbackErr: "Incorrecto. El primer WHEN evaluado es 'Sueldo >= 50000', que es verdadero para 80000. SQL Server devuelve 'Medio' y no evalúa los demás WHEN."
  },
  {
    q: "¿Cuál es la diferencia principal entre CASE simple y CASE buscado?",
    code: null,
    opts: [
      "El CASE simple es más rápido porque usa índices automáticamente",
      "El CASE buscado solo puede usarse en la cláusula WHERE",
      "El CASE simple compara por igualdad; el buscado permite cualquier operador en cada WHEN",
      "No hay diferencia, son completamente equivalentes"
    ],
    correct: 2,
    feedback: "Correcto. El CASE simple evalúa solo igualdad (CASE col WHEN valor). El CASE buscado permite condiciones libres en cada WHEN: rangos con >, <, BETWEEN, IS NULL, LIKE, etc.",
    feedbackErr: "Incorrecto. La diferencia clave es que CASE simple solo permite igualdad, mientras que CASE buscado permite cualquier tipo de condición en cada WHEN."
  },
  {
    q: "¿Por qué este CASE nunca detecta los NULLs?",
    code: `CASE Telefono
  WHEN NULL THEN 'Sin dato'
  ELSE Telefono
END`,
    opts: [
      "Porque NULL no es una palabra reservada en SQL Server",
      "Porque CASE simple usa = para comparar, y NULL = NULL es UNKNOWN, no TRUE",
      "Porque hay que poner WHEN 'NULL' entre comillas",
      "Porque NULL solo puede usarse en CASE buscado si la columna es de tipo VARCHAR"
    ],
    correct: 1,
    feedback: "Correcto. En SQL, ninguna comparación con NULL usando = devuelve TRUE: NULL = NULL es UNKNOWN. Para detectar NULLs hay que usar CASE buscado con WHEN columna IS NULL.",
    feedbackErr: "Incorrecto. El problema es que CASE simple usa = para comparar y NULL = NULL devuelve UNKNOWN en SQL, no TRUE. La solución es usar CASE buscado con IS NULL."
  },
  {
    q: "¿En cuál de estas cláusulas NO se puede usar CASE?",
    code: null,
    opts: [
      "SELECT",
      "ORDER BY",
      "GROUP BY",
      "CASE se puede usar en todas las cláusulas anteriores"
    ],
    correct: 3,
    feedback: "Correcto. CASE es una expresión y puede usarse en SELECT, WHERE, ORDER BY, GROUP BY, HAVING, y dentro de funciones de agregación. Es una de las herramientas más versátiles de SQL.",
    feedbackErr: "Incorrecto. CASE puede usarse en todas esas cláusulas. Es una expresión, no una sentencia, por lo que puede aparecer en cualquier lugar donde SQL espere un valor."
  }
];

let answered = [], score = 0;

function buildQuiz() {
  answered = new Array(questions.length).fill(false);
  score = 0;
  const c = document.getElementById('quiz-container');
  c.innerHTML = '';
  const letters = ['A','B','C','D'];
  questions.forEach((q, qi) => {
    const optsHtml = q.opts.map((o, oi) =>
      `<button class="option" onclick="answer(${qi},${oi})" id="opt-${qi}-${oi}">
         <span class="opt-letter">${letters[oi]}</span>${o}
       </button>`
    ).join('');
    const codeBlock = q.code
      ? `<div class="quiz-code">${q.code
          .replace(/\bCASE\b/g,'<span class="kw">CASE</span>')
          .replace(/\bWHEN\b/g,'<span class="kw">WHEN</span>')
          .replace(/\bTHEN\b/g,'<span class="kw">THEN</span>')
          .replace(/\bELSE\b/g,'<span class="kw">ELSE</span>')
          .replace(/\bEND\b/g,'<span class="kw">END</span>')
          .replace(/>=/g,'<span class="op">&gt;=</span>')
          .replace(/\b(\d+)\b/g,'<span class="nm">$1</span>')
          .replace(/'([^']*)'/g,"<span class=\"st\">'$1'</span>")
        }</div>`
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
  document.querySelectorAll(`[id^="opt-${qi}-"]`).forEach(o => o.disabled = true);
  const fb = document.getElementById(`fb-${qi}`);
  if (oi === q.correct) {
    score++;
    document.getElementById(`opt-${qi}-${oi}`).classList.add('correct');
    fb.textContent = '✓ ' + q.feedback;
    fb.className = 'feedback show ok';
  } else {
    document.getElementById(`opt-${qi}-${oi}`).classList.add('wrong');
    document.getElementById(`opt-${qi}-${q.correct}`).classList.add('correct');
    fb.textContent = '✗ ' + q.feedbackErr;
    fb.className = 'feedback show err';
  }
  if (answered.every(Boolean)) setTimeout(showScore, 600);
}

function showScore() {
  const pct = Math.round(score / questions.length * 100);
  const msgs = ['Repasá el material nuevamente.','Buen intento, seguí practicando.','Bien! Estás en el buen camino.','Muy bien! Dominás el tema.','¡Perfecto!'];
  document.getElementById('score-val').textContent = `${score}/${questions.length}`;
  document.getElementById('score-msg').textContent = `${pct}% — ${msgs[Math.min(Math.floor(pct/25),4)]}`;
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
