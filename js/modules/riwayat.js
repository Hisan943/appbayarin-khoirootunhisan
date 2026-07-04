// ===== RIWAYAT MODULE =====

import { formatRupiah, formatDate } from '../utils.js';

let app = null;

export function initRiwayat(appInstance) {
    app = appInstance;
    const section = document.getElementById('section-riwayat');
    if (!section) return;
    
    renderRiwayatSection(section);
    setupRiwayatEvents();
}

function renderRiwayatSection(section) {
    section.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
                <div class="card-title" style="margin-bottom: 0;">
                    <i class="fas fa-clock-rotate-left"></i>
                    Riwayat Transaksi
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-outline btn-sm" id="filterAllBtn">
                        <i class="fas fa-list"></i> Semua
                    </button>
                    <button class="btn btn-outline btn-sm" id="filterTagihanBtn">
                        <i class="fas fa-file-invoice"></i> Tagihan
                    </button>
                    <button class="btn btn-outline btn-sm" id="filterSPPBtn">
                        <i class="fas fa-graduation-cap"></i> SPP
                    </button>
                    <button class="btn btn-outline btn-sm" id="filterPulsaBtn">
                        <i class="fas fa-sim-card"></i> Pulsa
                    </button>
                    <button class="btn btn-danger btn-sm" id="clearHistoryBtn">
                        <i class="fas fa-trash"></i> Hapus Semua
                    </button>
                </div>
            </div>
            
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Jenis</th>
                            <th>Deskripsi</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="riwayatBody"></tbody>
                </table>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">
                <i class="fas fa-chart-simple"></i>
                Statistik Pengeluaran
            </div>
            <div class="grid-3col" id="statsGrid">
                <div style="background: #f0f9f6; padding: 16px; border-radius: var(--radius-sm); text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Transaksi</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="statTotal">0</div>
                </div>
                <div style="background: #f0f9f6; padding: 16px; border-radius: var(--radius-sm); text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Pengeluaran</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="statTotalAmount">Rp 0</div>
                </div>
                <div style="background: #f0f9f6; padding: 16px; border-radius: var(--radius-sm); text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Rata-rata per Transaksi</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="statAverage">Rp 0</div>
                </div>
            </div>
        </div>
    `;
    
    // Render data awal
    renderRiwayat();
    updateStats();
}

function setupRiwayatEvents() {
    // Filter buttons
    document.getElementById('filterAllBtn').addEventListener('click', () => renderRiwayat('all'));
    document.getElementById('filterTagihanBtn').addEventListener('click', () => renderRiwayat('tagihan'));
    document.getElementById('filterSPPBtn').addEventListener('click', () => renderRiwayat('spp'));
    document.getElementById('filterPulsaBtn').addEventListener('click', () => renderRiwayat('pulsa'));
    
    // Clear history
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        if (confirm('Yakin ingin menghapus semua riwayat transaksi?')) {
            app.clearHistory();
            renderRiwayat();
            updateStats();
        }
    });
}

function renderRiwayat(filter = 'all') {
    const tbody = document.getElementById('riwayatBody');
    if (!tbody) return;
    
    let history = app.getHistory();
    
    // Filter
    if (filter !== 'all') {
        history = history.filter(trx => trx.type.toLowerCase().includes(filter));
    }
    
    if (history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 8px;"></i>
                    ${filter !== 'all' ? `Tidak ada transaksi ${filter}` : 'Belum ada transaksi'}
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = history.map(trx => `
        <tr>
            <td>${formatDate(trx.date)}</td>
            <td><span class="badge-status">${trx.type}</span></td>
            <td>${trx.desc}</td>
            <td>${formatRupiah(trx.total)}</td>
            <td><span class="badge-status badge-paid">${trx.status}</span></td>
        </tr>
    `).join('');
    
    // Update stats
    updateStats(history);
}

function updateStats(history = null) {
    if (!history) {
        history = app.getHistory();
    }
    
    const total = history.length;
    const totalAmount = history.reduce((sum, t) => sum + t.total, 0);
    const average = total > 0 ? Math.round(totalAmount / total) : 0;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statTotalAmount').textContent = formatRupiah(totalAmount);
    document.getElementById('statAverage').textContent = formatRupiah(average);
}

// Export untuk refresh dari luar
export function refreshRiwayat() {
    renderRiwayat();
    updateStats();
}