// ── TABS ──────────────────────────────────
function showTab(name, idx) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  document.getElementById('progress').style.width = Math.round((idx+1)/6*100) + '%';
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

// ── DEMO CADENAS ─────────────────────────
function updateStrDemo() {
  const txt   = document.getElementById('str-input').value;
  const start = parseInt(document.getElementById('str-start').value) || 1;
  const len   = parseInt(document.getElementById('str-len').value)   || 1;

  const safeSub = () => {
    const s = start - 1;
    return txt.trim().substring(s, s + len);
  };

  const items = [
    { label:'Input original', fn:'(valor ingresado)',  val: `"${txt}"` },
    { label:'UPPER()',        fn:'UPPER(texto)',        val: txt.toUpperCase() },
    { label:'LOWER()',        fn:'LOWER(texto)',        val: txt.toLowerCase() },
    { label:'TRIM()',         fn:'TRIM(texto)',         val: txt.trim() },
    { label:'LEN()',          fn:'LEN(TRIM(texto))',    val: txt.trim().length },
    { label:'LEFT(texto,3)',  fn:'LEFT(texto,3)',       val: txt.trim().substring(0, 3) },
    { label:'RIGHT(texto,3)', fn:'RIGHT(texto,3)',      val: txt.trim().slice(-3) },
    { label:`SUBSTRING(texto,${start},${len})`, fn:`SUBSTRING(texto,${start},${len})`, val: safeSub() || '(vacío)' },
    { label:'REVERSE()',      fn:'REVERSE(TRIM(texto))',val: txt.trim().split('').reverse().join('') },
    { label:'CHARINDEX("S")',  fn:'CHARINDEX("S",texto)', val: (txt.toUpperCase().indexOf('S') + 1) || 0 },
    { label:'REPLACE(" ","_")',fn:'REPLACE(texto," ","_")', val: txt.replaceAll(' ','_') },
    { label:'LTRIM()',        fn:'LTRIM(texto)',        val: txt.trimStart() },
  ];

  document.getElementById('str-result').innerHTML = items.map(i =>
    `<div class="demo-result-item">
      <div class="dri-label">${i.label}</div>
      <div class="dri-fn">${i.fn}</div>
      <div class="dri-val">${i.val}</div>
    </div>`
  ).join('');
}

// ── DEMO FECHAS ──────────────────────────
function updateFechaDemo() {
  const val = document.getElementById('fecha-input').value;
  if (!val) return;
  const f   = new Date(val + 'T12:00:00');
  const hoy = new Date();

  const diffMs   = hoy - f;
  const diffDias = Math.floor(diffMs / 86400000);
  const diffAños = Math.floor(diffDias / 365.25);
  const diffMeses= Math.floor(diffDias / 30.44);

  // verificar si ya cumplió este año
  const cumpleEsteAño = new Date(hoy.getFullYear(), f.getMonth(), f.getDate());
  const edadExacta = hoy >= cumpleEsteAño ? hoy.getFullYear()-f.getFullYear() : hoy.getFullYear()-f.getFullYear()-1;

  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dias  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

  const eoMes = new Date(f.getFullYear(), f.getMonth()+1, 0);
  const d30   = new Date(f); d30.setDate(d30.getDate()+30);
  const d1y   = new Date(f); d1y.setFullYear(d1y.getFullYear()+1);

  const pad = n => String(n).padStart(2,'0');
  const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;

  const items = [
    { label:'YEAR(fecha)',        fn:'YEAR()',        val: f.getFullYear() },
    { label:'MONTH(fecha)',       fn:'MONTH()',       val: f.getMonth()+1 },
    { label:'DAY(fecha)',         fn:'DAY()',         val: f.getDate() },
    { label:'Día de la semana',   fn:'DATENAME(weekday,fecha)', val: dias[f.getDay()] },
    { label:'Nombre del mes',     fn:'DATENAME(month,fecha)',   val: meses[f.getMonth()] },
    { label:'Edad exacta',        fn:'Cálculo con DATEDIFF',    val: edadExacta + ' años' },
    { label:'DATEDIFF(day,...)',   fn:'DATEDIFF(day,fecha,GETDATE())', val: diffDias + ' días' },
    { label:'DATEDIFF(month,...)', fn:'DATEDIFF(month,...)',    val: diffMeses + ' meses' },
    { label:'DATEADD(day,30,...)', fn:'DATEADD(day,30,fecha)',  val: fmt(d30) },
    { label:'DATEADD(year,1,...)', fn:'DATEADD(year,1,fecha)',  val: fmt(d1y) },
    { label:'EOMONTH(fecha)',      fn:'EOMONTH()',              val: fmt(eoMes) },
    { label:'FORMAT dd/MM/yyyy',   fn:"FORMAT(fecha,'dd/MM/yyyy')", val: fmt(f) },
  ];

  document.getElementById('fecha-result').innerHTML = items.map(i =>
    `<div class="demo-result-item">
      <div class="dri-label">${i.label}</div>
      <div class="dri-fn">${i.fn}</div>
      <div class="dri-val">${i.val}</div>
    </div>`
  ).join('');
}

// ── DEMO CONVERSIÓN ───────────────────────
function updateConvDemo() {
  const raw  = document.getElementById('conv-input').value.trim();
  const type = document.getElementById('conv-type').value;
  const num  = parseFloat(raw);
  const isNum = !isNaN(num);

  let castResult, tryResult, note = '';

  switch(type) {
    case 'int':
      castResult = isNum ? Math.trunc(num) + ' (INT)' : 'ERROR — conversion failed';
      tryResult  = isNum ? Math.trunc(num) + ' (INT)' : 'NULL';
      note = 'Los decimales se truncan, no se redondean.';
      break;
    case 'decimal':
      castResult = isNum ? num.toFixed(2) + ' (DECIMAL)' : 'ERROR — conversion failed';
      tryResult  = isNum ? num.toFixed(2) + ' (DECIMAL)' : 'NULL';
      note = 'Se conservan exactamente 2 decimales.';
      break;
    case 'varchar':
      castResult = `'${raw}' (VARCHAR)`;
      tryResult  = `'${raw}' (VARCHAR)`;
      note = 'Cualquier valor puede convertirse a VARCHAR.';
      break;
    case 'bit':
      if (!isNum) { castResult = 'ERROR'; tryResult = 'NULL'; note = 'BIT solo acepta 0 o 1.'; }
      else if (num === 0) { castResult = '0 (BIT = false)'; tryResult = '0 (BIT)'; note = ''; }
      else { castResult = '1 (BIT = true)'; tryResult = '1 (BIT)'; note = 'Cualquier número != 0 se convierte a 1.'; }
      break;
  }

  const items = [
    { label:'Valor original',  fn:'(sin convertir)',           val: `"${raw}"` },
    { label:'CAST(val AS ...)', fn:`CAST('${raw}' AS ${type.toUpperCase()})`, val: castResult },
    { label:'TRY_CAST()',      fn:`TRY_CAST('${raw}' AS ${type.toUpperCase()})`, val: tryResult },
    { label:'Nota',            fn:'⚠ comportamiento',          val: note || '—' },
  ];

  document.getElementById('conv-result').innerHTML = items.map(i =>
    `<div class="demo-result-item">
      <div class="dri-label">${i.label}</div>
      <div class="dri-fn">${i.fn}</div>
      <div class="dri-val" style="${i.val.includes('ERROR')?'color:var(--coral)':''}">${i.val}</div>
    </div>`
  ).join('');
}

// ── DEMO NÚMEROS ──────────────────────────
function updateNumDemo() {
  const raw = document.getElementById('num-input').value.trim();
  const dec = parseInt(document.getElementById('num-dec').value) || 0;
  const n   = parseFloat(raw);
  const isN = !isNaN(n);

  const items = [
    { label:'ABS()',                   fn:`ABS(${raw})`,            val: isN ? Math.abs(n) : 'NaN' },
    { label:`ROUND(n,${dec})`,         fn:`ROUND(${raw},${dec})`,   val: isN ? parseFloat(n.toFixed(dec)) : 'NaN' },
    { label:'FLOOR()',                  fn:`FLOOR(${raw})`,          val: isN ? Math.floor(n) : 'NaN' },
    { label:'CEILING()',                fn:`CEILING(${raw})`,        val: isN ? Math.ceil(n)  : 'NaN' },
    { label:'SIGN()',                   fn:`SIGN(${raw})`,           val: isN ? Math.sign(n)  : 'NaN' },
    { label:'SQRT() — si ≥ 0',         fn:`SQRT(ABS(${raw}))`,      val: isN ? Math.sqrt(Math.abs(n)).toFixed(4) : 'NaN' },
    { label:'POWER(n, 2)',             fn:`POWER(${raw}, 2)`,        val: isN ? parseFloat((Math.pow(n,2)).toFixed(4)) : 'NaN' },
    { label:'ROUND(n,−1)',             fn:`ROUND(${raw},−1)`,        val: isN ? Math.round(n/10)*10 : 'NaN' },
  ];

  document.getElementById('num-result').innerHTML = items.map(i =>
    `<div class="demo-result-item">
      <div class="dri-label">${i.label}</div>
      <div class="dri-fn">${i.fn}</div>
      <div class="dri-val">${i.val}</div>
    </div>`
  ).join('');
}

// ── QUIZ ─────────────────────────────────
const questions = [
  {
    q: "¿Qué devuelve LEN('  Hola  ')?",
    code: null,
    opts:['8','4','6','10'],
    correct: 2,
    ok: "Correcto. LEN no cuenta los espacios finales pero sí los iniciales. '  Hola  ' tiene 2 espacios al inicio + 4 letras = 6 (los 2 espacios finales se descartan).",
    err: "Incorrecto. LEN descarta los espacios del final pero no los del inicio. '  Hola  ' → 6 (2 espacios iniciales + 4 letras)."
  },
  {
    q: "¿Cuál es el resultado de este código?",
    code: "SELECT SUBSTRING('SQL Server 2019', 5, 6)",
    opts:["'Server'","'SQL Se'","'erver '","'Server '"],
    correct: 0,
    ok: "Correcto. SUBSTRING empieza en la posición 5 (la 'S' de 'Server') y extrae 6 caracteres → 'Server'.",
    err: "Incorrecto. Las posiciones en SQL empiezan en 1: posición 5 es la 'S' de 'Server', y 6 caracteres más dan 'Server'."
  },
  {
    q: "¿Qué diferencia hay entre CAST y TRY_CAST?",
    code: null,
    opts:[
      "TRY_CAST es más rápido porque no valida el tipo de dato",
      "CAST lanza un error si la conversión falla; TRY_CAST devuelve NULL",
      "TRY_CAST solo funciona con tipos de texto, CAST con cualquier tipo",
      "No hay diferencia, son sinónimos"
    ],
    correct: 1,
    ok: "Correcto. CAST falla con error si el valor no puede convertirse. TRY_CAST devuelve NULL en lugar de interrumpir la consulta, lo que es ideal para datos potencialmente sucios.",
    err: "Incorrecto. La diferencia clave es el comportamiento ante errores: CAST interrumpe la consulta con error, TRY_CAST devuelve NULL."
  },
  {
    q: "¿Qué función usarías para calcular cuántos años tiene un empleado a partir de su FechaNac?",
    code: null,
    opts:[
      "YEAR(GETDATE()) - YEAR(FechaNac)",
      "DATEDIFF(year, FechaNac, GETDATE())",
      "DATEADD(year, FechaNac, GETDATE())",
      "Las opciones A y B dan exactamente el mismo resultado siempre"
    ],
    correct: 1,
    ok: "Correcto. DATEDIFF(year,...) es la función correcta. La opción A (resta de años) da un año de diferencia si la persona todavía no cumplió en el año actual. Por eso se suele combinar con una corrección usando CASE.",
    err: "Incorrecto. La diferencia de años con A puede estar mal si el cumpleaños no pasó todavía. DATEDIFF(year,...) es el enfoque correcto, aunque también requiere ajuste para ser exacto."
  },
  {
    q: "¿Qué resultado da COALESCE(NULL, NULL, 'Hola', 'Mundo')?",
    code: null,
    opts:["NULL","'Hola'","'Mundo'","'Hola Mundo'"],
    correct: 1,
    ok: "Correcto. COALESCE devuelve el PRIMER valor no nulo de la lista. Los primeros dos son NULL, por lo que devuelve 'Hola'.",
    err: "Incorrecto. COALESCE evalúa los argumentos de izquierda a derecha y devuelve el primero que no sea NULL. En este caso: 'Hola'."
  },
  {
    q: "¿Cuál es la diferencia entre FLOOR(-3.2) y CEILING(-3.2)?",
    code: null,
    opts:[
      "FLOOR devuelve -3, CEILING devuelve -4",
      "FLOOR devuelve -4, CEILING devuelve -3",
      "Ambas devuelven -3",
      "Ambas devuelven -4"
    ],
    correct: 1,
    ok: "Correcto. FLOOR siempre redondea hacia abajo (hacia el infinito negativo): -3.2 → -4. CEILING siempre redondea hacia arriba: -3.2 → -3.",
    err: "Incorrecto. FLOOR va hacia abajo (más negativo): -3.2 → -4. CEILING va hacia arriba (menos negativo): -3.2 → -3."
  }
];

let answered = [], score = 0;

function buildQuiz() {
  answered = new Array(questions.length).fill(false);
  score = 0;
  const c = document.getElementById('quiz-container');
  c.innerHTML = '';
  const L = ['A','B','C','D'];
  questions.forEach((q, qi) => {
    const code = q.code ? `<div class="quiz-code">${q.code}</div>` : '';
    const opts = q.opts.map((o, oi) =>
      `<button class="option" onclick="answer(${qi},${oi})" id="opt-${qi}-${oi}">
         <span class="opt-letter">${L[oi]}</span>${o}
       </button>`
    ).join('');
    c.innerHTML += `
      <div class="quiz-card" id="qcard-${qi}">
        <div class="quiz-q">
          <span class="q-num">Pregunta ${qi+1} / ${questions.length}</span>${q.q}
        </div>
        ${code}
        <div class="options">${opts}</div>
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
    fb.textContent = '✓ ' + q.ok;
    fb.className = 'feedback show ok';
  } else {
    document.getElementById(`opt-${qi}-${oi}`).classList.add('wrong');
    document.getElementById(`opt-${qi}-${q.correct}`).classList.add('correct');
    fb.textContent = '✗ ' + q.err;
    fb.className = 'feedback show err';
  }
  if (answered.every(Boolean)) setTimeout(showScore, 600);
}

function showScore() {
  const pct = Math.round(score / questions.length * 100);
  const msgs = ['Repasá el material.','Seguí practicando.','Bien, vas por buen camino.','Muy bien dominado.','¡Perfecto!'];
  document.getElementById('score-val').textContent = `${score}/${questions.length}`;
  document.getElementById('score-msg').textContent = `${pct}% — ${msgs[Math.min(Math.floor(pct/25),4)]}`;
  document.getElementById('score-val').style.color = pct>=80 ? 'var(--accent)' : pct>=60 ? 'var(--amber)' : 'var(--coral)';
  document.getElementById('quiz-score').style.display = 'block';
  document.getElementById('quiz-score').scrollIntoView({behavior:'smooth'});
}

function resetQuiz() {
  document.getElementById('quiz-score').style.display = 'none';
  buildQuiz();
  document.getElementById('quiz-container').scrollIntoView({behavior:'smooth'});
}

// init demos
updateStrDemo();
updateFechaDemo();
updateConvDemo();
updateNumDemo();
buildQuiz();
