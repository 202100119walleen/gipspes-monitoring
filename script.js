/**
 * DOLE LDNPFO - GIP Document Monitoring System
 * Master JavaScript Logic Sheet (v8 - Executive Sidebar & Responsive Navigation)
 */

const LOCAL_STORAGE_KEY = 'dole_gip_monitoring_db_v6';
const SUPABASE_CONFIG_KEY = 'dole_gip_supabase_config';

// Supabase Global Client Instance
let supabaseClient = null;
let isSupabaseConnected = false;
let realtimeSubscription = null;

// Initial Sample Seed Data
const DEFAULT_SEED_DATA = {
  dtrRecords: [
    {
      id: 'dtr-101',
      gipName: 'Maria Santos',
      month: '2026-07',
      quincena: '1st Quincena (1-15)',
      dtrArDateReceived: '2026-07-05',
      remarks: 'Complete DTR & AR attached and verified.',
      createdAt: '2026-07-05T08:00:00.000Z'
    },
    {
      id: 'dtr-102',
      gipName: 'Juan Dela Cruz',
      month: '2026-07',
      quincena: '1st Quincena (1-15)',
      dtrArDateReceived: '2026-07-15',
      remarks: 'DTR & AR received at LDNPFO. Pending transmittal to RO.',
      createdAt: '2026-07-15T09:30:00.000Z'
    },
    {
      id: 'dtr-103',
      gipName: 'Angela Reyes',
      month: '2026-07',
      quincena: '2nd Quincena (16-31)',
      dtrArDateReceived: '',
      remarks: 'Awaiting submission of DTR & Accomplishment Report.',
      createdAt: '2026-07-28T14:15:00.000Z'
    },
    {
      id: 'dtr-104',
      gipName: 'Christian Gonzales',
      month: '2026-06',
      quincena: '2nd Quincena (16-31)',
      dtrArDateReceived: '2026-06-30',
      remarks: 'Processed and submitted for payroll clearing.',
      createdAt: '2026-06-30T11:00:00.000Z'
    }
  ],
  transmittalRecords: [
    {
      id: 'trn-201',
      particulars: 'Transmittal Letter #2026-07-042:\nTransmittal of 15 sets DTR & AR for July 1st Quincena, including Summary of Hours Worked & Accomplishments, Approved Work Programs, and Deployment Logs.',
      dateTransmitted: '2026-07-14',
      regionalDateReceived: '2026-07-16',
      remarks: 'Transmittal Letter acknowledged and signed by Regional Office.',
      createdAt: '2026-07-14T10:00:00.000Z'
    },
    {
      id: 'trn-202',
      particulars: 'Transmittal Letter #2026-07-088:\n10 sets DTR & AR for July 2nd Quincena, Internship Attendance Logs, Performance Rating Reports',
      dateTransmitted: '2026-07-25',
      regionalDateReceived: '',
      remarks: 'Dispatched via courier services. Tracking #PH982341.',
      createdAt: '2026-07-25T15:20:00.000Z'
    }
  ]
};

// Application State Object
let appState = {
  activeTab: 'dtr', // 'dtr' | 'transmittal'
  searchQuery: '',
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  editingRecordId: null,
  deletingRecordId: null,
  data: {
    dtrRecords: [],
    transmittalRecords: []
  }
};

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  loadLocalStorageData();
  await initSupabaseClient();
  renderApp();
});

/**
 * Initialize Supabase SDK Client
 */
async function initSupabaseClient() {
  updateConnectionBadge('connecting', 'Connecting...');
  try {
    const storedConfig = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (!storedConfig) {
      setLocalMode();
      return;
    }

    const { url, key } = JSON.parse(storedConfig);
    if (!url || !key || !window.supabase) {
      setLocalMode();
      return;
    }

    supabaseClient = window.supabase.createClient(url, key);

    const { error } = await supabaseClient.from('gip_dtr_ar_records').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase test query warning:', error.message);
    }

    isSupabaseConnected = true;
    updateConnectionBadge('connected', 'Supabase Connected');

    document.getElementById('supabase-url').value = url;
    document.getElementById('supabase-key').value = key;

    await fetchRecordsFromSupabase();
    subscribeSupabaseRealtime();

  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    setLocalMode();
  }
}

function setLocalMode() {
  isSupabaseConnected = false;
  supabaseClient = null;
  updateConnectionBadge('offline', 'Local Storage Mode');
}

function updateConnectionBadge(status, text) {
  const badge = document.getElementById('connection-status-badge');
  const dot = document.getElementById('connection-status-dot');
  const textElem = document.getElementById('connection-status-text');

  if (badge && dot && textElem) {
    badge.className = `meta-badge ${status}`;
    dot.className = `status-dot ${status}`;
    textElem.textContent = text;
  }
}

/**
 * Load LocalStorage Backup Data
 */
function loadLocalStorageData() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      appState.data = JSON.parse(stored);
    } else {
      appState.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
      saveToLocalStorage();
    }
  } catch (err) {
    console.error('Failed to load local storage:', err);
    appState.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState.data));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

/**
 * Fetch Data from Supabase Tables
 */
async function fetchRecordsFromSupabase() {
  if (!isSupabaseConnected || !supabaseClient) return;

  try {
    const { data: dtrData, error: dtrErr } = await supabaseClient
      .from('gip_dtr_ar_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (dtrErr) throw dtrErr;

    const { data: trnData, error: trnErr } = await supabaseClient
      .from('transmittal_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (trnErr) throw trnErr;

    appState.data.dtrRecords = (dtrData || []).map(r => ({
      id: r.id,
      gipName: r.gip_name,
      month: r.month,
      quincena: r.quincena,
      dtrArDateReceived: r.dtr_ar_date_received,
      remarks: r.remarks,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    appState.data.transmittalRecords = (trnData || []).map(r => ({
      id: r.id,
      particulars: r.particulars,
      dateTransmitted: r.date_transmitted,
      regionalDateReceived: r.regional_date_received,
      remarks: r.remarks,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    saveToLocalStorage();
    renderApp();
  } catch (err) {
    console.error('Error fetching data from Supabase:', err.message);
    showToast('Cloud database sync error: ' + err.message, 'danger');
  }
}

/**
 * Realtime Subscriptions for Multi-User Sync
 */
function subscribeSupabaseRealtime() {
  if (!isSupabaseConnected || !supabaseClient) return;

  if (realtimeSubscription) {
    supabaseClient.removeChannel(realtimeSubscription);
  }

  realtimeSubscription = supabaseClient
    .channel('public-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      fetchRecordsFromSupabase();
    })
    .subscribe();
}

/**
 * Bind DOM Event Listeners
 */
function bindEvents() {
  // Sidebar Navigation Items
  document.getElementById('side-nav-dtr').addEventListener('click', () => switchTab('dtr'));
  document.getElementById('side-nav-transmittal').addEventListener('click', () => switchTab('transmittal'));
  document.getElementById('side-nav-settings').addEventListener('click', openSupabaseModal);
  document.getElementById('side-nav-excel').addEventListener('click', handleExportExcel);
  document.getElementById('side-nav-print').addEventListener('click', handlePrintReport);

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const appSidebar = document.getElementById('app-sidebar');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('mobile-open');
      sidebarOverlay.classList.toggle('mobile-open');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      appSidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('mobile-open');
    });
  }

  // Search Input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value.trim().toLowerCase();
    renderTable();
  });

  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    searchInput.value = '';
    appState.searchQuery = '';
    renderTable();
    showToast('Search reset', 'info');
  });

  // Particulars Live Form Preview Listener
  const particularsTextarea = document.getElementById('particulars');
  particularsTextarea.addEventListener('input', handleParticularsLivePreview);

  // Header Action Buttons
  document.getElementById('btn-add-record').addEventListener('click', () => openRecordModal());

  // Supabase Configuration Form
  document.getElementById('supabase-form').addEventListener('submit', handleSaveSupabaseConfig);
  document.getElementById('btn-disconnect-supabase').addEventListener('click', handleDisconnectSupabase);
  document.getElementById('supabase-modal-close').addEventListener('click', closeSupabaseModal);
  document.getElementById('supabase-modal-done').addEventListener('click', closeSupabaseModal);
  document.getElementById('btn-copy-sql').addEventListener('click', copySqlScriptToClipboard);

  // Form Submission
  document.getElementById('record-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('modal-close-btn').addEventListener('click', closeRecordModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeRecordModal);

  // Delete Confirmation Modal
  document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-cancel-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm-btn').addEventListener('click', confirmDeleteRecord);

  // Modal Backdrop Click to Close
  document.getElementById('record-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeRecordModal();
  });
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
  document.getElementById('supabase-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSupabaseModal();
  });
}

/**
 * Switch Active View Tab
 */
function switchTab(tabName) {
  if (appState.activeTab === tabName) return;
  appState.activeTab = tabName;

  // Close mobile sidebar if open
  document.getElementById('app-sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('mobile-open');

  // Update active sidebar nav items
  document.querySelectorAll('.sidebar-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`side-nav-${tabName}`).classList.add('active');

  // Update Page Title and Subtitle
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');

  if (tabName === 'dtr') {
    viewTitle.textContent = 'GIP DTR & AR Monitoring';
    viewSubtitle.textContent = 'Daily Time Records & Accomplishment Reports tracking';
  } else {
    viewTitle.textContent = 'Transmittal Monitoring';
    viewSubtitle.textContent = 'Document transmittals sent to Regional Office';
  }

  appState.sortColumn = 'createdAt';
  appState.sortDirection = 'desc';

  renderApp();
}

/**
 * Master Render Function
 */
function renderApp() {
  updateCountsAndStats();
  renderTable();
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Update Header Counters & Dashboard Stat Cards
 */
function updateCountsAndStats() {
  const dtrCount = appState.data.dtrRecords.length;
  const trnCount = appState.data.transmittalRecords.length;

  document.getElementById('side-count-dtr').textContent = dtrCount;
  document.getElementById('side-count-transmittal').textContent = trnCount;

  const currentDataset = appState.activeTab === 'dtr' 
    ? appState.data.dtrRecords 
    : appState.data.transmittalRecords;

  document.getElementById('stat-dtr-count').textContent = dtrCount;
  document.getElementById('stat-trn-count').textContent = trnCount;
  document.getElementById('stat-active-count').textContent = currentDataset.length;
}

/**
 * Filter & Sort Active Dataset
 */
function getFilteredAndSortedRecords() {
  const isDtr = appState.activeTab === 'dtr';
  let records = isDtr ? [...appState.data.dtrRecords] : [...appState.data.transmittalRecords];

  if (appState.searchQuery) {
    const q = appState.searchQuery;
    records = records.filter(r => {
      if (isDtr) {
        return (r.gipName || '').toLowerCase().includes(q) ||
               (r.quincena || '').toLowerCase().includes(q) ||
               (r.month || '').toLowerCase().includes(q) ||
               (r.remarks || '').toLowerCase().includes(q);
      } else {
        return (r.particulars || '').toLowerCase().includes(q) ||
               (r.remarks || '').toLowerCase().includes(q);
      }
    });
  }

  records.sort((a, b) => {
    let valA = a[appState.sortColumn] || '';
    let valB = b[appState.sortColumn] || '';

    if (valA < valB) return appState.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return appState.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return records;
}

/**
 * Render Data Table Header and Rows
 */
function renderTable() {
  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');
  const emptyState = document.getElementById('empty-state');
  const isDtr = appState.activeTab === 'dtr';

  if (isDtr) {
    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('gipName')">
          <div class="th-content">GIP Name ${getSortIcon('gipName')}</div>
        </th>
        <th onclick="handleSort('month')">
          <div class="th-content">Payroll Period / Quincena ${getSortIcon('month')}</div>
        </th>
        <th onclick="handleSort('dtrArDateReceived')">
          <div class="th-content">DTR & AR Date Received by DOLE LDNPFO ${getSortIcon('dtrArDateReceived')}</div>
        </th>
        <th>
          <div class="th-content">Remarks</div>
        </th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
  } else {
    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('particulars')">
          <div class="th-content">Particulars (Documents Transmitted) ${getSortIcon('particulars')}</div>
        </th>
        <th onclick="handleSort('dateTransmitted')">
          <div class="th-content">Date Transmitted ${getSortIcon('dateTransmitted')}</div>
        </th>
        <th onclick="handleSort('regionalDateReceived')">
          <div class="th-content">Date Received by Regional Office ${getSortIcon('regionalDateReceived')}</div>
        </th>
        <th>
          <div class="th-content">Remarks</div>
        </th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
  }

  const records = getFilteredAndSortedRecords();

  if (records.length === 0) {
    tableBody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  tableBody.innerHTML = records.map(record => {
    if (isDtr) {
      const quincenaLabel = record.quincena || '1st Quincena (1-15)';
      const monthFormatted = formatMonth(record.month);
      const isQ2 = String(quincenaLabel).includes('2nd');
      const qClass = isQ2 ? 'quincena-q2' : 'quincena-q1';

      return `
        <tr>
          <td style="font-weight: 600; font-size: 0.95rem;">${escapeHtml(record.gipName)}</td>
          <td>
            <span class="quincena-pill ${qClass}">
              <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
              ${monthFormatted} - ${escapeHtml(quincenaLabel)}
            </span>
          </td>
          <td>${formatDate(record.dtrArDateReceived)}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 280px;">${escapeHtml(record.remarks || '-')}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Record">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Record">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else {
      const memoFormatted = formatParticularsMemoCard(record.particulars);
      return `
        <tr>
          <td>${memoFormatted}</td>
          <td>${formatDate(record.dateTransmitted)}</td>
          <td>${formatDate(record.regionalDateReceived)}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 280px;">${escapeHtml(record.remarks || '-')}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Record">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Record">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Formats Transmittal Particulars into an Executive Document Card
 */
function formatParticularsMemoCard(rawText) {
  if (!rawText || !rawText.trim()) {
    return `<span style="color: var(--text-light); font-style: italic;">No particulars specified</span>`;
  }

  const text = rawText.trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  let titleHeader = null;
  let bodyLines = [];

  lines.forEach((line, index) => {
    const isHeaderLine = line.endsWith(':') || 
                         /^transmittal\s+of/i.test(line) || 
                         /^transmittal\s+letter/i.test(line) ||
                         /^subject:/i.test(line) || 
                         /^re:/i.test(line);

    if (isHeaderLine && index === 0 && lines.length > 1) {
      titleHeader = line.replace(/:$/, '');
    } else {
      const cleanedLine = line
        .replace(/^[\d]+[\.\)]\s*/, '')
        .replace(/^[•\-\*\+]\s*/, '')
        .trim();
      if (cleanedLine.length > 0) {
        bodyLines.push(cleanedLine);
      }
    }
  });

  if (bodyLines.length === 0 && titleHeader) {
    bodyLines = [titleHeader];
    titleHeader = null;
  }

  let formattedBody = bodyLines.join('\n');

  formattedBody = escapeHtml(formattedBody)
    .replace(/(\b\d+\s+sets?\b|\b1st Quincena\b|\b2nd Quincena\b|\bBatch\s+\d+\b|\bDTRs?\s*&\s*ARs?\b)/gi, 
      '<span class="inline-tag">$1</span>');

  let html = `<div class="particulars-memo-box">`;

  if (titleHeader) {
    html += `
      <div class="particulars-memo-title">
        <i data-lucide="file-text" style="width: 14px; height: 14px; color: var(--primary-blue);"></i>
        <span>${escapeHtml(titleHeader)}</span>
      </div>
    `;
  }

  html += `<div class="particulars-memo-body">${formattedBody}</div>`;
  html += `</div>`;

  return html;
}

/**
 * Live Form Preview Handler for Particulars Textarea
 */
function handleParticularsLivePreview() {
  const textarea = document.getElementById('particulars');
  const previewWrapper = document.getElementById('particulars-preview-wrapper');
  const previewContainer = document.getElementById('particulars-live-preview');

  const text = textarea.value.trim();
  if (!text) {
    previewWrapper.style.display = 'none';
    previewContainer.innerHTML = '';
  } else {
    previewWrapper.style.display = 'block';
    previewContainer.innerHTML = formatParticularsMemoCard(text);
    if (window.lucide) lucide.createIcons();
  }
}

/**
 * Dynamic Column Sort Trigger
 */
function handleSort(colName) {
  if (appState.sortColumn === colName) {
    appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    appState.sortColumn = colName;
    appState.sortDirection = 'asc';
  }
  renderTable();
}

function getSortIcon(colName) {
  if (appState.sortColumn !== colName) {
    return `<span class="sort-icon">↕</span>`;
  }
  return `<span class="sort-icon">${appState.sortDirection === 'asc' ? '↑' : '↓'}</span>`;
}

/**
 * Form & Modal Handling (Add / Edit)
 */
function openRecordModal(id = null) {
  const isDtr = appState.activeTab === 'dtr';
  appState.editingRecordId = id;

  const modalTitle = document.getElementById('modal-title');
  const dtrFields = document.getElementById('fields-dtr');
  const trnFields = document.getElementById('fields-transmittal');
  const form = document.getElementById('record-form');

  form.reset();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('record-month').value = currentMonthStr;
  document.getElementById('record-quincena').value = '1st Quincena (1-15)';

  document.getElementById('particulars-preview-wrapper').style.display = 'none';

  if (isDtr) {
    dtrFields.style.display = 'block';
    trnFields.style.display = 'none';
    document.getElementById('gip-name').required = true;
    document.getElementById('record-month').required = true;
    document.getElementById('record-quincena').required = true;
    document.getElementById('particulars').required = false;
  } else {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'block';
    document.getElementById('gip-name').required = false;
    document.getElementById('record-month').required = false;
    document.getElementById('record-quincena').required = false;
    document.getElementById('particulars').required = true;
  }

  if (id) {
    modalTitle.textContent = isDtr ? 'Edit GIP DTR & AR Record' : 'Edit Transmittal Record';
    const dataset = isDtr ? appState.data.dtrRecords : appState.data.transmittalRecords;
    const record = dataset.find(r => r.id === id);

    if (record) {
      document.getElementById('form-record-id').value = record.id;
      document.getElementById('record-remarks').value = record.remarks || '';

      if (isDtr) {
        document.getElementById('gip-name').value = record.gipName || '';
        document.getElementById('record-month').value = record.month || currentMonthStr;
        document.getElementById('record-quincena').value = record.quincena || '1st Quincena (1-15)';
        document.getElementById('dtr-ar-date-received').value = record.dtrArDateReceived || '';
      } else {
        document.getElementById('particulars').value = record.particulars || '';
        document.getElementById('date-transmitted').value = record.dateTransmitted || '';
        document.getElementById('regional-date-received-trn').value = record.regionalDateReceived || '';
        handleParticularsLivePreview();
      }
    }
  } else {
    modalTitle.textContent = isDtr ? 'Add New GIP DTR & AR Record' : 'Add New Transmittal Record';
    document.getElementById('form-record-id').value = '';
  }

  document.getElementById('record-modal').classList.add('active');
}

function closeRecordModal() {
  document.getElementById('record-modal').classList.remove('active');
  appState.editingRecordId = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const isDtr = appState.activeTab === 'dtr';
  const recordId = document.getElementById('form-record-id').value;
  const remarks = document.getElementById('record-remarks').value.trim();

  const nowISO = new Date().toISOString();

  if (isDtr) {
    const gipName = document.getElementById('gip-name').value.trim();
    const month = document.getElementById('record-month').value;
    const quincena = document.getElementById('record-quincena').value;
    const dtrArDateReceived = document.getElementById('dtr-ar-date-received').value;

    if (!gipName) {
      showToast('GIP Name is required', 'danger');
      return;
    }

    const payload = {
      gipName,
      month,
      quincena,
      dtrArDateReceived,
      remarks,
      updatedAt: nowISO
    };

    if (recordId) {
      const index = appState.data.dtrRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.dtrRecords[index] = { ...appState.data.dtrRecords[index], ...payload };
      }

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_dtr_ar_records').update({
          gip_name: gipName,
          month,
          quincena,
          dtr_ar_date_received: dtrArDateReceived,
          remarks,
          updated_at: nowISO
        }).eq('id', recordId);
      }

      showToast('GIP Record updated successfully!', 'success');
    } else {
      const newId = 'dtr-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.dtrRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_dtr_ar_records').insert([{
          id: newId,
          gip_name: gipName,
          month,
          quincena,
          dtr_ar_date_received: dtrArDateReceived,
          remarks,
          created_at: nowISO,
          updated_at: nowISO
        }]);
      }

      showToast('New GIP Record added successfully!', 'success');
    }
  } else {
    const particulars = document.getElementById('particulars').value.trim();
    const dateTransmitted = document.getElementById('date-transmitted').value;
    const regionalDateReceived = document.getElementById('regional-date-received-trn').value;

    if (!particulars) {
      showToast('Particulars field is required', 'danger');
      return;
    }

    const payload = {
      particulars,
      dateTransmitted,
      regionalDateReceived,
      remarks,
      updatedAt: nowISO
    };

    if (recordId) {
      const index = appState.data.transmittalRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.transmittalRecords[index] = { ...appState.data.transmittalRecords[index], ...payload };
      }

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('transmittal_records').update({
          particulars,
          date_transmitted: dateTransmitted,
          regional_date_received: regionalDateReceived,
          remarks,
          updated_at: nowISO
        }).eq('id', recordId);
      }

      showToast('Transmittal record updated successfully!', 'success');
    } else {
      const newId = 'trn-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.transmittalRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('transmittal_records').insert([{
          id: newId,
          particulars,
          date_transmitted: dateTransmitted,
          regional_date_received: regionalDateReceived,
          remarks,
          created_at: nowISO,
          updated_at: nowISO
        }]);
      }

      showToast('New Transmittal record added successfully!', 'success');
    }
  }

  saveToLocalStorage();
  closeRecordModal();
  renderApp();
}

/**
 * Delete Modal Handlers
 */
function openDeleteModal(id) {
  const isDtr = appState.activeTab === 'dtr';
  appState.deletingRecordId = id;

  const dataset = isDtr ? appState.data.dtrRecords : appState.data.transmittalRecords;
  const record = dataset.find(r => r.id === id);

  if (!record) return;

  const summary = isDtr 
    ? `GIP Name: ${record.gipName} (${formatMonth(record.month)} - ${record.quincena || '1st Quincena'})` 
    : `Particulars: ${record.particulars.substring(0, 50)}...`;

  document.getElementById('delete-record-summary').textContent = summary;
  document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.remove('active');
  appState.deletingRecordId = null;
}

async function confirmDeleteRecord() {
  const id = appState.deletingRecordId;
  if (!id) return;

  const isDtr = appState.activeTab === 'dtr';
  if (isDtr) {
    appState.data.dtrRecords = appState.data.dtrRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_dtr_ar_records').delete().eq('id', id);
    }
  } else {
    appState.data.transmittalRecords = appState.data.transmittalRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('transmittal_records').delete().eq('id', id);
    }
  }

  saveToLocalStorage();
  closeDeleteModal();
  renderApp();
  showToast('Record deleted successfully', 'info');
}

/**
 * Supabase Settings Modal Handlers
 */
function openSupabaseModal() {
  const storedConfig = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (storedConfig) {
    try {
      const { url, key } = JSON.parse(storedConfig);
      document.getElementById('supabase-url').value = url || '';
      document.getElementById('supabase-key').value = key || 'sb_publishable_LqDDREJQqzUD3BEVNWtuzA_Z3wIy_wU';
    } catch (e) {}
  } else {
    document.getElementById('supabase-key').value = 'sb_publishable_LqDDREJQqzUD3BEVNWtuzA_Z3wIy_wU';
  }
  document.getElementById('supabase-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeSupabaseModal() {
  document.getElementById('supabase-modal').classList.remove('active');
}

async function handleSaveSupabaseConfig(e) {
  e.preventDefault();
  const url = document.getElementById('supabase-url').value.trim();
  const key = document.getElementById('supabase-key').value.trim();

  if (!url || !key) {
    showToast('Please enter both Supabase URL and API Key', 'danger');
    return;
  }

  try {
    const config = { url, key };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    showToast('Testing Supabase connection...', 'info');
    await initSupabaseClient();

    if (isSupabaseConnected) {
      showToast('Successfully connected to Supabase!', 'success');
      closeSupabaseModal();
    } else {
      showToast('Could not verify Supabase connection. Check your URL and Key.', 'danger');
    }
  } catch (err) {
    showToast('Connection failed: ' + err.message, 'danger');
  }
}

function handleDisconnectSupabase() {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  setLocalMode();
  closeSupabaseModal();
  showToast('Disconnected from Supabase. Switched to Local Storage Mode.', 'info');
}

function copySqlScriptToClipboard() {
  const sqlText = document.getElementById('sql-script-code').innerText;
  navigator.clipboard.writeText(sqlText).then(() => {
    showToast('SQL script copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'danger');
  });
}

/**
 * Excel Export Handler using SheetJS (XLSX)
 */
function handleExportExcel() {
  try {
    const wb = XLSX.utils.book_new();

    const dtrDataFormatted = appState.data.dtrRecords.map(r => ({
      'GIP Name': r.gipName,
      'Month / Year': formatMonth(r.month),
      'Quincena (Payroll Period)': r.quincena || '1st Quincena (1-15)',
      'DTR & AR Date Received (LDNPFO)': r.dtrArDateReceived || 'N/A',
      'Remarks': r.remarks || ''
    }));

    const wsDtr = XLSX.utils.json_to_sheet(dtrDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsDtr, 'GIP DTR & AR');

    const trnDataFormatted = appState.data.transmittalRecords.map(r => ({
      'Particulars (Transmitted Documents)': (r.particulars || '').replace(/\r?\n/g, ' '),
      'Date Transmitted': r.dateTransmitted || 'N/A',
      'Date Received (Regional Office)': r.regionalDateReceived || 'N/A',
      'Remarks': r.remarks || ''
    }));

    const wsTrn = XLSX.utils.json_to_sheet(trnDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsTrn, 'Transmittals');

    const today = new Date().toISOString().split('T')[0];
    const fileName = `DOLE_LDNPFO_GIP_Monitoring_${today}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('Excel file downloaded successfully!', 'success');
  } catch (err) {
    console.error('XLSX export error, falling back to CSV:', err);
    exportFallbackCSV();
  }
}

/**
 * CSV Fallback Exporter
 */
function exportFallbackCSV() {
  const isDtr = appState.activeTab === 'dtr';
  const records = isDtr ? appState.data.dtrRecords : appState.data.transmittalRecords;

  let csvContent = 'data:text/csv;charset=utf-8,';
  if (isDtr) {
    csvContent += 'GIP Name,Month,Quincena,DTR & AR Date Received (LDNPFO),Remarks\n';
    records.forEach(r => {
      csvContent += `"${r.gipName}","${r.month}","${r.quincena}","${r.dtrArDateReceived}","${r.remarks}"\n`;
    });
  } else {
    csvContent += 'Particulars,Date Transmitted,Date Received (Regional Office),Remarks\n';
    records.forEach(r => {
      const cleanParticulars = (r.particulars || '').replace(/\r?\n/g, ' ');
      csvContent += `"${cleanParticulars}","${r.dateTransmitted}","${r.regionalDateReceived}","${r.remarks}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GIP_Monitoring_Export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV file downloaded!', 'info');
}

/**
 * Print Handler
 */
function handlePrintReport() {
  const titleElem = document.getElementById('print-report-title');
  const timestampElem = document.getElementById('print-timestamp');

  const moduleName = appState.activeTab === 'dtr' ? 'GIP DTR & AR Monitoring' : 'Transmittal Monitoring';
  titleElem.textContent = `DOLE LDNPFO - ${moduleName} Official Report`;
  timestampElem.textContent = `Generated on: ${new Date().toLocaleString()}`;

  window.print();
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Formatting Utility Helpers
 */
function formatDate(dateStr) {
  if (!dateStr) return '<span style="color: var(--text-light);">-</span>';
  try {
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function formatMonth(monthStr) {
  if (!monthStr) return 'N/A';
  try {
    const [y, m] = monthStr.split('-');
    if (!y || !m) return monthStr;
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch (e) {
    return monthStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
