/**
 * DOLE LDNPFO - GIP Document Monitoring System
 * Master JavaScript Logic Sheet (v11 - Pre-configured Supabase Project URL & Anon Key)
 */

const LOCAL_STORAGE_KEY = 'dole_gip_monitoring_db_v9';
const SUPABASE_CONFIG_KEY = 'dole_gip_supabase_config';

// Pre-configured Supabase Project Credentials from window.ENV or fallback
const DEFAULT_SUPABASE_CONFIG = {
  url: (window.ENV && window.ENV.SUPABASE_URL) || 'https://gprkzegwymkufrbmzakd.supabase.co',
  key: (window.ENV && window.ENV.SUPABASE_ANON_KEY) || 'sb_publishable_LqDDREJQqzUD3BEVNWtuzA_Z3wIy_wU'
};

// Supabase Global Client Instance
let supabaseClient = null;
let isSupabaseConnected = false;
let realtimeSubscription = null;

// Initial Sample Seed Data (All Uppercase)
const DEFAULT_SEED_DATA = {
  dtrRecords: [
    {
      id: 'dtr-101',
      gipName: 'MARIA SANTOS',
      month: '2026-07',
      quincena: '1ST QUINCENA (1-15)',
      dtrArDateReceived: '2026-07-05',
      remarks: 'COMPLETE DTR & AR ATTACHED AND VERIFIED.',
      createdAt: '2026-07-05T08:00:00.000Z'
    },
    {
      id: 'dtr-102',
      gipName: 'JUAN DELA CRUZ',
      month: '2026-07',
      quincena: '1ST QUINCENA (1-15)',
      dtrArDateReceived: '2026-07-15',
      remarks: 'DTR & AR RECEIVED AT LDNPFO. PENDING TRANSMITTAL TO RO.',
      createdAt: '2026-07-15T09:30:00.000Z'
    },
    {
      id: 'dtr-103',
      gipName: 'ANGELA REYES',
      month: '2026-07',
      quincena: '2ND QUINCENA (16-31)',
      dtrArDateReceived: '',
      remarks: 'AWAITING SUBMISSION OF DTR & ACCOMPLISHMENT REPORT.',
      createdAt: '2026-07-28T14:15:00.000Z'
    },
    {
      id: 'dtr-104',
      gipName: 'CHRISTIAN GONZALES',
      month: '2026-06',
      quincena: '2ND QUINCENA (16-31)',
      dtrArDateReceived: '2026-06-30',
      remarks: 'PROCESSED AND SUBMITTED FOR PAYROLL CLEARING.',
      createdAt: '2026-06-30T11:00:00.000Z'
    }
  ],
  transmittalRecords: [
    {
      id: 'trn-201',
      particulars: 'TRANSMITTAL LETTER #2026-07-042:\nTRANSMITTAL OF 15 SETS DTR & AR FOR JULY 1ST QUINCENA, INCLUDING SUMMARY OF HOURS WORKED & ACCOMPLISHMENTS, APPROVED WORK PROGRAMS, AND DEPLOYMENT LOGS.',
      preparedBy: 'MARIA SANTOS / ADMINISTRATIVE ASSISTANT',
      dateTransmitted: '2026-07-14',
      regionalDateReceived: '2026-07-16',
      remarks: 'TRANSMITTAL LETTER ACKNOWLEDGED AND SIGNED BY REGIONAL OFFICE.',
      createdAt: '2026-07-14T10:00:00.000Z'
    },
    {
      id: 'trn-202',
      particulars: 'TRANSMITTAL LETTER #2026-07-088:\n10 SETS DTR & AR FOR JULY 2ND QUINCENA, INTERNSHIP ATTENDANCE LOGS, PERFORMANCE RATING REPORTS',
      preparedBy: 'JUAN DELA CRUZ / GIP COORDINATOR',
      dateTransmitted: '2026-07-25',
      regionalDateReceived: '',
      remarks: 'DISPATCHED VIA COURIER SERVICES. TRACKING #PH982341.',
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
 * Initialize Supabase SDK Client with pre-configured URL & Key
 */
async function initSupabaseClient() {
  updateConnectionBadge('connecting', 'CONNECTING...');
  try {
    const url = (window.ENV && window.ENV.SUPABASE_URL) || DEFAULT_SUPABASE_CONFIG.url;
    const key = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_CONFIG.key;

    if (!url || !key || !window.supabase) {
      setLocalMode();
      return;
    }

    supabaseClient = window.supabase.createClient(url, key);

    const { error } = await supabaseClient.from('gip_dtr_ar_records').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase connection test note:', error ? error.message : 'OK');
    }

    isSupabaseConnected = true;
    updateConnectionBadge('connected', 'SUPABASE CONNECTED');

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
  updateConnectionBadge('offline', 'LOCAL STORAGE MODE');
}

function updateConnectionBadge(status, text) {
  const badge = document.getElementById('connection-status-badge');
  const dot = document.getElementById('connection-status-dot');
  const textElem = document.getElementById('connection-status-text');

  if (badge && dot && textElem) {
    badge.className = `meta-badge ${status}`;
    dot.className = `status-dot ${status}`;
    textElem.textContent = text.toUpperCase();
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

    const hasRemoteData = (dtrData && dtrData.length > 0) || (trnData && trnData.length > 0);
    const hasLocalData = (appState.data.dtrRecords && appState.data.dtrRecords.length > 0) || 
                         (appState.data.transmittalRecords && appState.data.transmittalRecords.length > 0);

    if (hasRemoteData) {
      appState.data.dtrRecords = (dtrData || []).map(r => ({
        id: r.id,
        gipName: (r.gip_name || '').toUpperCase(),
        month: r.month,
        quincena: (r.quincena || '').toUpperCase(),
        dtrArDateReceived: r.dtr_ar_date_received,
        remarks: (r.remarks || '').toUpperCase(),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      appState.data.transmittalRecords = (trnData || []).map(r => ({
        id: r.id,
        particulars: (r.particulars || '').toUpperCase(),
        preparedBy: (r.prepared_by || '').toUpperCase(),
        dateTransmitted: r.date_transmitted,
        regionalDateReceived: r.regional_date_received,
        remarks: (r.remarks || '').toUpperCase(),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      saveToLocalStorage();
      renderApp();
    } else if (hasLocalData) {
      // Remote DB is empty, automatically seed remote DB with existing local data
      await pushLocalDataToSupabase();
    }
  } catch (err) {
    console.error('Cloud database sync notice:', err.message);
    showToast('WORKING IN LOCAL BACKUP MODE (SUPABASE SYNC NOTE)', 'info');
  }
}

/**
 * Auto-sync Local Records to Supabase Cloud Database
 */
async function pushLocalDataToSupabase() {
  if (!isSupabaseConnected || !supabaseClient) return;

  try {
    if (appState.data.dtrRecords && appState.data.dtrRecords.length > 0) {
      const dtrPayload = appState.data.dtrRecords.map(r => ({
        id: r.id,
        gip_name: r.gipName,
        month: r.month,
        quincena: r.quincena,
        dtr_ar_date_received: r.dtrArDateReceived,
        remarks: r.remarks,
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('gip_dtr_ar_records').upsert(dtrPayload);
    }

    if (appState.data.transmittalRecords && appState.data.transmittalRecords.length > 0) {
      const trnPayload = appState.data.transmittalRecords.map(r => ({
        id: r.id,
        particulars: r.particulars,
        prepared_by: r.preparedBy,
        date_transmitted: r.dateTransmitted,
        regional_date_received: r.regionalDateReceived,
        remarks: r.remarks,
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('transmittal_records').upsert(trnPayload);
    }
  } catch (err) {
    console.warn('Auto-push local data note:', err.message);
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
    showToast('SEARCH RESET', 'info');
  });

  // Particulars Live Form Preview Listener
  const particularsTextarea = document.getElementById('particulars');
  particularsTextarea.addEventListener('input', handleParticularsLivePreview);

  // Header Action Buttons
  document.getElementById('btn-add-record').addEventListener('click', () => openRecordModal());

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
}

/**
 * Switch Active View Tab
 */
function switchTab(tabName) {
  if (appState.activeTab === tabName) return;
  appState.activeTab = tabName;

  document.getElementById('app-sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('mobile-open');

  document.querySelectorAll('.sidebar-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`side-nav-${tabName}`).classList.add('active');

  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');

  if (tabName === 'dtr') {
    viewTitle.textContent = 'GIP DTR & AR MONITORING';
    viewSubtitle.textContent = 'DAILY TIME RECORDS & ACCOMPLISHMENT REPORTS TRACKING';
  } else {
    viewTitle.textContent = 'TRANSMITTAL MONITORING';
    viewSubtitle.textContent = 'DOCUMENT TRANSMITTALS SENT TO REGIONAL OFFICE';
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
               (r.preparedBy || '').toLowerCase().includes(q) ||
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
          <div class="th-content">GIP NAME ${getSortIcon('gipName')}</div>
        </th>
        <th onclick="handleSort('month')">
          <div class="th-content">PAYROLL PERIOD / QUINCENA ${getSortIcon('month')}</div>
        </th>
        <th onclick="handleSort('dtrArDateReceived')">
          <div class="th-content">DTR & AR DATE RECEIVED BY DOLE LDNPFO ${getSortIcon('dtrArDateReceived')}</div>
        </th>
        <th>
          <div class="th-content">REMARKS</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;
  } else {
    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('particulars')">
          <div class="th-content">PARTICULARS (DOCUMENTS TRANSMITTED) ${getSortIcon('particulars')}</div>
        </th>
        <th onclick="handleSort('preparedBy')">
          <div class="th-content">PREPARED BY ${getSortIcon('preparedBy')}</div>
        </th>
        <th onclick="handleSort('dateTransmitted')">
          <div class="th-content">DATE TRANSMITTED ${getSortIcon('dateTransmitted')}</div>
        </th>
        <th onclick="handleSort('regionalDateReceived')">
          <div class="th-content">DATE RECEIVED BY REGIONAL OFFICE ${getSortIcon('regionalDateReceived')}</div>
        </th>
        <th>
          <div class="th-content">REMARKS</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
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
      const quincenaLabel = (record.quincena || '1ST QUINCENA (1-15)').toUpperCase();
      const monthFormatted = formatMonth(record.month).toUpperCase();
      const isQ2 = String(quincenaLabel).includes('2ND');
      const qClass = isQ2 ? 'quincena-q2' : 'quincena-q1';

      return `
        <tr>
          <td style="font-weight: 600; font-size: 0.95rem;">${escapeHtml(record.gipName).toUpperCase()}</td>
          <td>
            <span class="quincena-pill ${qClass}">
              <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
              ${monthFormatted} - ${escapeHtml(quincenaLabel)}
            </span>
          </td>
          <td>${formatDate(record.dtrArDateReceived)}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 280px;">${escapeHtml(record.remarks || '-').toUpperCase()}</td>
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
          <td><span style="font-weight: 600; color: var(--text-main);">${escapeHtml(record.preparedBy || '-').toUpperCase()}</span></td>
          <td>${formatDate(record.dateTransmitted)}</td>
          <td>${formatDate(record.regionalDateReceived)}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 240px;">${escapeHtml(record.remarks || '-').toUpperCase()}</td>
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
    return `<span style="color: var(--text-light); font-style: italic;">NO PARTICULARS SPECIFIED</span>`;
  }

  const text = rawText.trim().toUpperCase();
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
    .replace(/(\b\d+\s+SETS?\b|\b1ST QUINCENA\b|\b2ND QUINCENA\b|\bBATCH\s+\d+\b|\bDTRS?\s*&\s*ARS?\b)/gi, 
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

  const text = textarea.value.trim().toUpperCase();
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
    document.getElementById('prepared-by-trn').required = false;
  } else {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'block';
    document.getElementById('gip-name').required = false;
    document.getElementById('record-month').required = false;
    document.getElementById('record-quincena').required = false;
    document.getElementById('particulars').required = true;
    document.getElementById('prepared-by-trn').required = true;
  }

  if (id) {
    modalTitle.textContent = isDtr ? 'EDIT GIP DTR & AR RECORD' : 'EDIT TRANSMITTAL RECORD';
    const dataset = isDtr ? appState.data.dtrRecords : appState.data.transmittalRecords;
    const record = dataset.find(r => r.id === id);

    if (record) {
      document.getElementById('form-record-id').value = record.id;
      document.getElementById('record-remarks').value = (record.remarks || '').toUpperCase();

      if (isDtr) {
        document.getElementById('gip-name').value = (record.gipName || '').toUpperCase();
        document.getElementById('record-month').value = record.month || currentMonthStr;
        document.getElementById('record-quincena').value = record.quincena || '1st Quincena (1-15)';
        document.getElementById('dtr-ar-date-received').value = record.dtrArDateReceived || '';
      } else {
        document.getElementById('particulars').value = (record.particulars || '').toUpperCase();
        document.getElementById('prepared-by-trn').value = (record.preparedBy || '').toUpperCase();
        document.getElementById('date-transmitted').value = record.dateTransmitted || '';
        document.getElementById('regional-date-received-trn').value = record.regionalDateReceived || '';
        handleParticularsLivePreview();
      }
    }
  } else {
    modalTitle.textContent = isDtr ? 'ADD NEW GIP DTR & AR RECORD' : 'ADD NEW TRANSMITTAL RECORD';
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
  const remarks = document.getElementById('record-remarks').value.trim().toUpperCase();

  const nowISO = new Date().toISOString();

  if (isDtr) {
    const gipName = document.getElementById('gip-name').value.trim().toUpperCase();
    const month = document.getElementById('record-month').value;
    const quincena = document.getElementById('record-quincena').value.toUpperCase();
    const dtrArDateReceived = document.getElementById('dtr-ar-date-received').value;

    if (!gipName) {
      showToast('GIP NAME IS REQUIRED', 'danger');
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
        const { error: sbErr } = await supabaseClient.from('gip_dtr_ar_records').upsert({
          id: recordId,
          gip_name: gipName,
          month,
          quincena,
          dtr_ar_date_received: dtrArDateReceived,
          remarks,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase update note:', sbErr.message);
      }

      showToast('GIP RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'dtr-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.dtrRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('gip_dtr_ar_records').upsert({
          id: newId,
          gip_name: gipName,
          month,
          quincena,
          dtr_ar_date_received: dtrArDateReceived,
          remarks,
          created_at: nowISO,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase insert note:', sbErr.message);
      }

      showToast('NEW GIP RECORD ADDED SUCCESSFULLY!', 'success');
    }
  } else {
    const particulars = document.getElementById('particulars').value.trim().toUpperCase();
    const preparedBy = document.getElementById('prepared-by-trn').value.trim().toUpperCase();
    const dateTransmitted = document.getElementById('date-transmitted').value;
    const regionalDateReceived = document.getElementById('regional-date-received-trn').value;

    if (!particulars) {
      showToast('PARTICULARS FIELD IS REQUIRED', 'danger');
      return;
    }
    if (!preparedBy) {
      showToast('PREPARED BY FIELD IS REQUIRED', 'danger');
      return;
    }

    const payload = {
      particulars,
      preparedBy,
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
        const { error: sbErr } = await supabaseClient.from('transmittal_records').upsert({
          id: recordId,
          particulars,
          prepared_by: preparedBy,
          date_transmitted: dateTransmitted,
          regional_date_received: regionalDateReceived,
          remarks,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase update note:', sbErr.message);
      }

      showToast('TRANSMITTAL RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'trn-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.transmittalRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('transmittal_records').upsert({
          id: newId,
          particulars,
          prepared_by: preparedBy,
          date_transmitted: dateTransmitted,
          regional_date_received: regionalDateReceived,
          remarks,
          created_at: nowISO,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase insert note:', sbErr.message);
      }

      showToast('NEW TRANSMITTAL RECORD ADDED SUCCESSFULLY!', 'success');
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
    ? `GIP NAME: ${record.gipName} (${formatMonth(record.month)} - ${record.quincena || '1ST QUINCENA'})` 
    : `PARTICULARS: ${record.particulars.substring(0, 50)}...`;

  document.getElementById('delete-record-summary').textContent = summary.toUpperCase();
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
  showToast('RECORD DELETED SUCCESSFULLY', 'info');
}



/**
 * Excel Export Handler using SheetJS (XLSX)
 */
function handleExportExcel() {
  try {
    const wb = XLSX.utils.book_new();

    const dtrDataFormatted = appState.data.dtrRecords.map(r => ({
      'GIP NAME': (r.gipName || '').toUpperCase(),
      'MONTH / YEAR': formatMonth(r.month).toUpperCase(),
      'QUINCENA (PAYROLL PERIOD)': (r.quincena || '1ST QUINCENA (1-15)').toUpperCase(),
      'DTR & AR DATE RECEIVED (LDNPFO)': r.dtrArDateReceived || 'N/A',
      'REMARKS': (r.remarks || '').toUpperCase()
    }));

    const wsDtr = XLSX.utils.json_to_sheet(dtrDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsDtr, 'GIP DTR & AR');

    const trnDataFormatted = appState.data.transmittalRecords.map(r => ({
      'PARTICULARS (TRANSMITTED DOCUMENTS)': (r.particulars || '').replace(/\r?\n/g, ' ').toUpperCase(),
      'PREPARED BY': (r.preparedBy || 'N/A').toUpperCase(),
      'DATE TRANSMITTED': r.dateTransmitted || 'N/A',
      'DATE RECEIVED (REGIONAL OFFICE)': r.regionalDateReceived || 'N/A',
      'REMARKS': (r.remarks || '').toUpperCase()
    }));

    const wsTrn = XLSX.utils.json_to_sheet(trnDataFormatted);
    XLSX.utils.book_append_sheet(wb, wsTrn, 'TRANSMITTALS');

    const today = new Date().toISOString().split('T')[0];
    const fileName = `DOLE_LDNPFO_GIP_MONITORING_${today}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('EXCEL FILE DOWNLOADED SUCCESSFULLY!', 'success');
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
    csvContent += 'GIP NAME,MONTH,QUINCENA,DTR & AR DATE RECEIVED (LDNPFO),REMARKS\n';
    records.forEach(r => {
      csvContent += `"${(r.gipName || '').toUpperCase()}","${r.month}","${(r.quincena || '').toUpperCase()}","${r.dtrArDateReceived}","${(r.remarks || '').toUpperCase()}"\n`;
    });
  } else {
    csvContent += 'PARTICULARS,PREPARED BY,DATE TRANSMITTED,DATE RECEIVED (REGIONAL OFFICE),REMARKS\n';
    records.forEach(r => {
      const cleanParticulars = (r.particulars || '').replace(/\r?\n/g, ' ').toUpperCase();
      csvContent += `"${cleanParticulars}","${(r.preparedBy || '').toUpperCase()}","${r.dateTransmitted}","${r.regionalDateReceived}","${(r.remarks || '').toUpperCase()}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GIP_MONITORING_EXPORT_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV FILE DOWNLOADED!', 'info');
}

/**
 * Print Handler
 */
function handlePrintReport() {
  const titleElem = document.getElementById('print-report-title');
  const timestampElem = document.getElementById('print-timestamp');

  const moduleName = appState.activeTab === 'dtr' ? 'GIP DTR & AR MONITORING' : 'TRANSMITTAL MONITORING';
  titleElem.textContent = `DOLE LDNPFO - ${moduleName} OFFICIAL REPORT`;
  timestampElem.textContent = `GENERATED ON: ${new Date().toLocaleString().toUpperCase()}`;

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
    <span>${escapeHtml(message).toUpperCase()}</span>
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
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
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
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return monthStr.toUpperCase();
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
