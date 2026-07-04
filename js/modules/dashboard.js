// ===== DASHBOARD MODULE =====

import { formatRupiah } from '../utils.js';

let app = null;

export function initDashboard(appInstance) {
    app = appInstance;
    const section = document.getElementById('section-dashboard');
    if (!section) return;
    
    // Render dashboard
    renderDashboard(section);
    
    // Setup quick access
    setupQuickAccess();
    
    // Setup event listeners untuk update statistik
    setupDashboardEvents();
}

function renderDashboard(section) {
    const history = app ? app.getHistory() : [];
    const saldo = app ? app.getSaldo() : 0;
    const totalTransaksi = history.length;
    const totalPengeluaran = history.reduce((sum, t) => sum + t.total, 0);
    
    section.innerHTML = `
        <!-- Quick Access -->
        <div class="card">
            <div class="card-title">
                <i class="fas fa-bolt"></i>
                Bayar Cepat
            </div>
            <div class="grid-3col">
                <div class="category-card" data-section="tagihan">
                    <i class="fas fa-file-invoice"></i>
                    <span>Tagihan</span>
                    <small style="color: var(--text-light);">PLN, PDAM, Internet</small>
                </div>
                <div class="category-card" data-section="spp">
                    <i class="fas fa-graduation-cap"></i>
                    <span>SPP Kuliah</span>
                    <small style="color: var(--text-light);">Cicilan Semester</small>
                </div>
                <div class="category-card" data-section="pulsa">
                    <i class="fas fa-mobile-screen"></i>
                    <span>Pulsa & Paket</span>
                    <small style="color: var(--text-light);">Semua Provider</small>
                </div>
            </div>
        </div>
        
        <!-- Promo Banner -->
        <div class="card">
            <div class="card-title">
                <i class="fas fa-tag" style="color: #f59e0b;"></i>
                Promo Spesial
            </div>
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px 24px; border-radius: var(--radius-sm);">
                <h4 style="color: #92400e; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-gift"></i>
                    Cashback 5% untuk Pembayaran Pertama
                </h4>
                <p style="color: #78350f; margin-top: 6px; font-size: 0.95rem;">
                    Maksimal cashback Rp 25.000 untuk semua kategori pembayaran
                </p>
                <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                    <span style="background: #fbbf24; padding: 2px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #78350f;">
                        Berlaku hingga 31 Mar 2026
                    </span>
                    <span style="background: #fbbf24; padding: 2px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; color: #78350f;">
                        Min. transaksi Rp 50.000
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Statistik Cepat -->
        <div class="card">
            <div class="card-title">
                <i class="fas fa-chart-simple"></i>
                Ringkasan
            </div>
            <div class="grid-3col" id="quickStats">
                <div style="background: #f0f9f6; padding: 16px; border-radius: var(--radius-sm); text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Transaksi</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="statTotal">${totalTransaksi}</div>
                </div>
                <div style="background: #f0f9f6; padding: 16px; border-radius: var(--radius-sm); text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Pengeluaran</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="statTotalAmount">
                        ${formatRupiah(totalPengeluaran)}
                    </div>
                </div>
                <div style="background: #f0f9f6; padding: 16px; border-radius: var(--radius-sm); text-align: center;">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Saldo Tersisa</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);" id="statSaldo">${formatRupiah(saldo)}</div>
                </div>
            </div>
        </div>
    `;
}

function setupQuickAccess() {
    document.querySelectorAll('.category-card[data-section]').forEach(card => {
        card.addEventListener('click', function() {
            const section = this.dataset.section;
            if (app) {
                app.navigate(section);
            }
        });
    });
}

function setupDashboardEvents() {
    // Event listener untuk update statistik ketika ada perubahan
    document.addEventListener('transactionUpdate', function() {
        updateDashboardStats();
    });
}

export function updateDashboardStats() {
    if (!app) return;
    
    const history = app.getHistory();
    const saldo = app.getSaldo();
    const totalTransaksi = history.length;
    const totalPengeluaran = history.reduce((sum, t) => sum + t.total, 0);
    
    const statTotal = document.getElementById('statTotal');
    const statTotalAmount = document.getElementById('statTotalAmount');
    const statSaldo = document.getElementById('statSaldo');
    
    if (statTotal) statTotal.textContent = totalTransaksi;
    if (statTotalAmount) statTotalAmount.textContent = formatRupiah(totalPengeluaran);
    if (statSaldo) statSaldo.textContent = formatRupiah(saldo);
}