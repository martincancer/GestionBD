const fallbackDownloadsData = {
  links: [
    {
      title: 'W3Schools SQL Tutorial',
      category: 'Referencia general',
      description: 'Guia online para repasar sintaxis basica de SQL, consultas, filtros, joins, funciones y ejemplos rapidos.',
      url: 'https://www.w3schools.com/sql/default.asp',
      tags: ['SQL', 'Referencia', 'Online']
    }
  ],
  downloads: [
    {
      title: 'Sentencia CASE en SQL',
      category: 'Apunte de clase',
      description: 'Material de apoyo sobre el uso de la clausula CASE para resolver logica condicional dentro de consultas SQL.',
      type: 'PDF',
      size: '140 KB',
      file: 'Sentencia_CASE_en_SQL.pdf',
      tags: ['CASE', 'SQL'],
      resources: [{ label: 'Ver video', url: 'https://www.youtube.com/watch?v=UN7IZrKxAHY' }]
    },
    {
      title: 'SQL SUBCONSULTAS',
      category: 'Apunte de clase',
      description: 'Material complementario para practicar subconsultas, consultas anidadas y operadores habituales en SQL Server.',
      type: 'PDF',
      size: '361 KB',
      file: 'SQL_SUBCONSULTAS.pdf',
      tags: ['Subconsultas', 'SQL Server'],
      resources: [{ label: 'Ver video', url: 'https://www.youtube.com/watch?v=H7EAoryo10I&list=PLeA2nB3l8CHV3U7DLALy7EL4WadZDGebH&index=27&pp=iAQB' }]
    },
    {
      title: 'Triggers en SQL Server',
      category: 'Apunte de clase',
      description: 'Material de apoyo sobre el uso de triggers para automatizar acciones en la base de datos.',
      type: 'PDF',
      size: '247 KB',
      file: 'Triggers_SQL_Server.pdf',
      tags: ['Triggers', 'SQL Server'],
      resources: [{ label: 'Ver video', url: 'https://www.youtube.com/watch?v=jLk4BtAKZUM' }]
    },
    {
      title: 'Ejemplos de cursores en SQL Server',
      category: 'Ejemplos de clase',
      description: 'Archivo SQL con ejemplos de cursores para recorrer filas, actualizar totales y calcular acumulados.',
      type: 'SQL',
      size: '1.8 KB',
      file: 'Ejemplos_CURSORES.sql',
      tags: ['Cursores', 'SQL Server', 'Practica']
    },
    {
      title: 'ScreenREC - Grabacion de Pantalla',
      category: 'Aplicacion',
      description: 'Aplicacion ScreenREC para grabar pantallas.',
      type: 'ZIP',
      size: '37.4 MB',
      file: 'ScreenREC.zip',
      tags: ['Aplicacion', 'Grabacion']
    }
  ]
};

const linkIcon = `
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M6 4H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
    <path d="M10 2h4v4"/>
    <path d="M8 8l6-6"/>
  </svg>
`;

const downloadIcon = `
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 2v8"/>
    <path d="M4 7l4 4 4-4"/>
    <path d="M3 14h10"/>
  </svg>
`;

const videoIcon = `
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M14.5 4.4a1.8 1.8 0 0 0-1.3-1.3C12.1 2.8 8 2.8 8 2.8s-4.1 0-5.2.3a1.8 1.8 0 0 0-1.3 1.3A18 18 0 0 0 1.2 8c0 1.2.1 2.4.3 3.6a1.8 1.8 0 0 0 1.3 1.3c1.1.3 5.2.3 5.2.3s4.1 0 5.2-.3a1.8 1.8 0 0 0 1.3-1.3c.2-1.2.3-2.4.3-3.6s-.1-2.4-.3-3.6ZM6.7 10.2V5.8L10.5 8l-3.8 2.2Z"/>
  </svg>
`;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTags(tags = [], className = 'link-details') {
  if (!tags.length) return '';
  return `<div class="${className}">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderLinks(links = []) {
  const container = document.querySelector('#links-list');
  if (!container) return;

  container.innerHTML = links.map((link) => `
    <article class="link-card">
      <div class="link-icon">WEB</div>
      <div class="link-body">
        <div class="link-meta">${escapeHtml(link.category)}</div>
        <h2>${escapeHtml(link.title)}</h2>
        <p>${escapeHtml(link.description)}</p>
        ${renderTags(link.tags, 'link-details')}
      </div>
      <a class="link-btn" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">
        Abrir link
        ${linkIcon}
      </a>
    </article>
  `).join('');
}

function renderDownloads(downloads = []) {
  const container = document.querySelector('#downloads-list');
  if (!container) return;

  container.innerHTML = downloads.map((item) => {
    const resources = (item.resources || []).map((resource) => `
      <a class="resource-btn" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(resource.label || 'Abrir recurso')}
        ${videoIcon}
      </a>
    `).join('');

    return `
      <article class="download-card">
        <div class="file-icon">${escapeHtml(item.type)}</div>
        <div class="download-body">
          <div class="download-meta">${escapeHtml(item.category)}</div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description)}</p>
          <div class="file-details">
            <span>${escapeHtml(item.type)}</span>
            <span>${escapeHtml(item.size)}</span>
          </div>
        </div>
        <div class="download-actions">
          <a class="download-btn" href="../downloads/${encodeURIComponent(item.file)}" download>
            Descargar
            ${downloadIcon}
          </a>
          ${resources}
        </div>
      </article>
    `;
  }).join('');
}

function updateCounts(data) {
  const downloadCount = document.querySelector('#download-count');
  const linkCount = document.querySelector('#link-count');

  if (downloadCount) downloadCount.textContent = data.downloads.length;
  if (linkCount) linkCount.textContent = data.links.length;
}

async function loadDownloadsData() {
  try {
    const response = await fetch('../downloads.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar downloads.json');
    return await response.json();
  } catch (error) {
    return fallbackDownloadsData;
  }
}

loadDownloadsData().then((data) => {
  renderLinks(data.links || []);
  renderDownloads(data.downloads || []);
  updateCounts({ links: data.links || [], downloads: data.downloads || [] });
});
