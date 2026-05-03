const githubConfig = {
  owner: 'martincancer',
  repo: 'GestionBD',
  branch: 'master',
  apiBase: 'https://api.github.com'
};

const form = document.querySelector('#resource-form');
const tokenInput = document.querySelector('#github-token');
const modeInputs = Array.from(document.querySelectorAll('input[name="resource-type"]'));
const downloadFields = document.querySelector('.download-fields');
const linkFields = document.querySelector('.link-fields');
const fileInput = document.querySelector('#file');
const fileTypeInput = document.querySelector('#file-type');
const fileSizeInput = document.querySelector('#file-size');
const statusPanel = document.querySelector('#status-panel');
const statusLog = document.querySelector('#status-log');
const loadResourcesBtn = document.querySelector('#load-resources-btn');
const refreshResourcesBtn = document.querySelector('#refresh-resources-btn');
const publishedLinks = document.querySelector('#published-links');
const publishedDownloads = document.querySelector('#published-downloads');

let currentDownloadsState = null;

function setStatus(message, type = '') {
  statusPanel.classList.toggle('status-ok', type === 'ok');
  statusPanel.classList.toggle('status-error', type === 'error');
  statusLog.textContent = message;
}

function getMode() {
  return document.querySelector('input[name="resource-type"]:checked').value;
}

function updateMode() {
  const isDownload = getMode() === 'download';
  downloadFields.hidden = !isDownload;
  linkFields.hidden = isDownload;
  fileInput.required = isDownload;
  document.querySelector('#url').required = !isDownload;
}

function splitTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseRelatedResources(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|').map((part) => part.trim());
      return {
        label: parts[0] || 'Abrir recurso',
        url: parts[1] || ''
      };
    })
    .filter((resource) => resource.url);
}

function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function sanitizeFileName(name) {
  const parts = name.split('.');
  const extension = parts.length > 1 ? `.${parts.pop()}` : '';
  const baseName = parts.join('.') || name;

  return `${baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')}${extension.toLowerCase()}`;
}

function inferFileType(fileName) {
  const extension = fileName.split('.').pop()?.toUpperCase();
  return extension || 'ARCHIVO';
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function textToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToText(base64) {
  const binary = atob(base64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function githubRequest(path, options = {}) {
  const token = tokenInput.value.trim();
  if (!token) throw new Error('Pegá tu token de GitHub antes de publicar.');

  const response = await fetch(`${githubConfig.apiBase}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });

  if (response.status === 404 && options.allowNotFound) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Error de GitHub (${response.status})`);
  }
  return payload;
}

function contentsPath(path) {
  return `/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`;
}

async function getRepoFile(path) {
  return githubRequest(`${contentsPath(path)}?ref=${githubConfig.branch}`, {
    method: 'GET',
    allowNotFound: true
  });
}

async function putRepoFile(path, content, message, sha) {
  const body = {
    message,
    content,
    branch: githubConfig.branch
  };

  if (sha) body.sha = sha;

  return githubRequest(contentsPath(path), {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

async function deleteRepoFile(path, message, sha) {
  return githubRequest(contentsPath(path), {
    method: 'DELETE',
    body: JSON.stringify({
      message,
      sha,
      branch: githubConfig.branch
    })
  });
}

async function loadDownloadsJson() {
  const remoteFile = await getRepoFile('downloads.json');
  if (!remoteFile) {
    return {
      sha: null,
      data: { links: [], downloads: [] }
    };
  }

  return {
    sha: remoteFile.sha,
    data: JSON.parse(base64ToText(remoteFile.content))
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildLinkEntry() {
  return {
    title: document.querySelector('#title').value.trim(),
    category: document.querySelector('#category').value.trim(),
    description: document.querySelector('#description').value.trim(),
    url: document.querySelector('#url').value.trim(),
    tags: splitTags(document.querySelector('#tags').value)
  };
}

function buildDownloadEntry(fileName) {
  const resources = parseRelatedResources(document.querySelector('#resources').value);
  const entry = {
    title: document.querySelector('#title').value.trim(),
    category: document.querySelector('#category').value.trim(),
    description: document.querySelector('#description').value.trim(),
    type: document.querySelector('#file-type').value.trim().toUpperCase(),
    size: document.querySelector('#file-size').value.trim(),
    file: fileName,
    tags: splitTags(document.querySelector('#tags').value)
  };

  if (resources.length) entry.resources = resources;
  return entry;
}

function validateEntry(entry, mode) {
  if (!entry.title || !entry.category || !entry.description) {
    throw new Error('Completá título, categoría y descripción.');
  }

  if (mode === 'link' && !entry.url) {
    throw new Error('Completá la URL del link.');
  }

  if (mode === 'download' && (!entry.type || !entry.size || !entry.file)) {
    throw new Error('Completá los datos del archivo.');
  }
}

async function publishLink() {
  setStatus('Cargando downloads.json desde GitHub...');
  const { sha, data } = await loadDownloadsJson();
  data.links = Array.isArray(data.links) ? data.links : [];
  data.downloads = Array.isArray(data.downloads) ? data.downloads : [];

  const entry = buildLinkEntry();
  validateEntry(entry, 'link');
  data.links.push(entry);

  setStatus('Actualizando downloads.json...');
  await putRepoFile(
    'downloads.json',
    textToBase64(`${JSON.stringify(data, null, 2)}\n`),
    `Agregar link: ${entry.title}`,
    sha
  );
  await refreshPublishedResources(false);
}

async function publishDownload() {
  const file = fileInput.files[0];
  if (!file) throw new Error('Seleccioná un archivo para subir.');

  const fileName = sanitizeFileName(file.name);
  const remotePath = `downloads/${fileName}`;
  const overwrite = document.querySelector('#overwrite-file').checked;

  setStatus(`Verificando ${remotePath} en GitHub...`);
  const existingFile = await getRepoFile(remotePath);
  if (existingFile && !overwrite) {
    throw new Error(`El archivo ${fileName} ya existe. Marcá "Sobrescribir" si querés reemplazarlo.`);
  }

  setStatus(`Subiendo ${fileName}...`);
  await putRepoFile(
    remotePath,
    await fileToBase64(file),
    `${existingFile ? 'Actualizar' : 'Agregar'} archivo: ${fileName}`,
    existingFile?.sha
  );

  setStatus('Cargando downloads.json desde GitHub...');
  const { sha, data } = await loadDownloadsJson();
  data.links = Array.isArray(data.links) ? data.links : [];
  data.downloads = Array.isArray(data.downloads) ? data.downloads : [];

  const entry = buildDownloadEntry(fileName);
  validateEntry(entry, 'download');
  data.downloads.push(entry);

  setStatus('Actualizando downloads.json...');
  await putRepoFile(
    'downloads.json',
    textToBase64(`${JSON.stringify(data, null, 2)}\n`),
    `Agregar descarga: ${entry.title}`,
    sha
  );
  await refreshPublishedResources(false);
}

function renderPublishedResources(state) {
  const links = state.data.links || [];
  const downloads = state.data.downloads || [];

  publishedLinks.innerHTML = links.length ? links.map((link, index) => `
    <article class="published-item">
      <div class="published-meta">${escapeHtml(link.category || 'Link')}</div>
      <div class="published-title">${escapeHtml(link.title)}</div>
      <div class="published-detail">${escapeHtml(link.url)}</div>
      <div class="published-actions">
        <button class="danger-btn" type="button" data-delete-link="${index}">Eliminar link</button>
      </div>
    </article>
  `).join('') : '<p class="empty-state">No hay links cargados.</p>';

  publishedDownloads.innerHTML = downloads.length ? downloads.map((download, index) => `
    <article class="published-item">
      <div class="published-meta">${escapeHtml(download.category || 'Descarga')}</div>
      <div class="published-title">${escapeHtml(download.title)}</div>
      <div class="published-detail">${escapeHtml(download.file || '')}</div>
      <div class="published-actions">
        <button class="danger-btn soft" type="button" data-delete-download-entry="${index}">Eliminar entrada</button>
        <button class="danger-btn" type="button" data-delete-download-file="${index}">Eliminar entrada y archivo</button>
      </div>
    </article>
  `).join('') : '<p class="empty-state">No hay descargas cargadas.</p>';
}

async function refreshPublishedResources(showMessage = true) {
  if (showMessage) setStatus('Cargando recursos publicados desde GitHub...');
  currentDownloadsState = await loadDownloadsJson();
  currentDownloadsState.data.links = Array.isArray(currentDownloadsState.data.links) ? currentDownloadsState.data.links : [];
  currentDownloadsState.data.downloads = Array.isArray(currentDownloadsState.data.downloads) ? currentDownloadsState.data.downloads : [];
  renderPublishedResources(currentDownloadsState);
  if (showMessage) setStatus('Recursos publicados cargados correctamente.', 'ok');
}

async function deleteLink(index) {
  const state = await loadDownloadsJson();
  const links = Array.isArray(state.data.links) ? state.data.links : [];
  const item = links[index];
  if (!item) throw new Error('No se encontró el link a eliminar.');

  const confirmed = window.confirm(`¿Eliminar el link "${item.title}" de downloads.json?`);
  if (!confirmed) return;

  links.splice(index, 1);
  state.data.links = links;
  state.data.downloads = Array.isArray(state.data.downloads) ? state.data.downloads : [];

  setStatus('Eliminando link de downloads.json...');
  await putRepoFile(
    'downloads.json',
    textToBase64(`${JSON.stringify(state.data, null, 2)}\n`),
    `Eliminar link: ${item.title}`,
    state.sha
  );
  await refreshPublishedResources(false);
  setStatus('Link eliminado correctamente.', 'ok');
}

async function deleteDownload(index, removeFile) {
  const state = await loadDownloadsJson();
  const downloads = Array.isArray(state.data.downloads) ? state.data.downloads : [];
  const item = downloads[index];
  if (!item) throw new Error('No se encontró la descarga a eliminar.');

  const message = removeFile
    ? `¿Eliminar la entrada "${item.title}" y también el archivo downloads/${item.file}?`
    : `¿Eliminar solo la entrada "${item.title}" de downloads.json? El archivo queda en downloads.`;

  const confirmed = window.confirm(message);
  if (!confirmed) return;

  let remoteFile = null;
  if (removeFile) {
    setStatus(`Buscando archivo downloads/${item.file}...`);
    remoteFile = await getRepoFile(`downloads/${item.file}`);
    if (!remoteFile) throw new Error(`No se encontró downloads/${item.file} en GitHub.`);
  }

  downloads.splice(index, 1);
  state.data.downloads = downloads;
  state.data.links = Array.isArray(state.data.links) ? state.data.links : [];

  setStatus('Actualizando downloads.json...');
  await putRepoFile(
    'downloads.json',
    textToBase64(`${JSON.stringify(state.data, null, 2)}\n`),
    `Eliminar descarga: ${item.title}`,
    state.sha
  );

  if (removeFile) {
    setStatus(`Eliminando archivo downloads/${item.file}...`);
    await deleteRepoFile(
      `downloads/${item.file}`,
      `Eliminar archivo: ${item.file}`,
      remoteFile.sha
    );
  }

  await refreshPublishedResources(false);
  setStatus(removeFile ? 'Descarga y archivo eliminados correctamente.' : 'Entrada de descarga eliminada correctamente.', 'ok');
}

modeInputs.forEach((input) => input.addEventListener('change', updateMode));

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  fileTypeInput.value = fileTypeInput.value || inferFileType(file.name);
  fileSizeInput.value = formatFileSize(file.size);
});

loadResourcesBtn.addEventListener('click', async () => {
  loadResourcesBtn.disabled = true;
  try {
    await refreshPublishedResources();
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    loadResourcesBtn.disabled = false;
  }
});

refreshResourcesBtn.addEventListener('click', async () => {
  refreshResourcesBtn.disabled = true;
  try {
    await refreshPublishedResources();
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    refreshResourcesBtn.disabled = false;
  }
});

publishedLinks.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-link]');
  if (!button) return;
  button.disabled = true;

  try {
    await deleteLink(Number(button.dataset.deleteLink));
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
});

publishedDownloads.addEventListener('click', async (event) => {
  const entryButton = event.target.closest('[data-delete-download-entry]');
  const fileButton = event.target.closest('[data-delete-download-file]');
  const button = entryButton || fileButton;
  if (!button) return;
  button.disabled = true;

  try {
    if (entryButton) {
      await deleteDownload(Number(entryButton.dataset.deleteDownloadEntry), false);
    } else {
      await deleteDownload(Number(fileButton.dataset.deleteDownloadFile), true);
    }
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    button.disabled = false;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('.submit-btn');
  submitButton.disabled = true;

  try {
    if (getMode() === 'link') {
      await publishLink();
    } else {
      await publishDownload();
    }

    setStatus('Recurso publicado correctamente. GitHub Pages puede tardar unos segundos en actualizar el sitio.', 'ok');
    form.reset();
    updateMode();
  } catch (error) {
    setStatus(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
});

updateMode();
