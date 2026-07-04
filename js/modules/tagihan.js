// ===== TAGIHAN MODULE =====

import { 
    validatePelanggan, 
    showToast, 
    showLoading, 
    hideLoading, 
    simulateApiCall,
    formatRupiah
} from '../utils.js';
import { billData } from '../data.js';
import { processPayment } from './payment.js';

let app = null;
let currentCategory = 'pln';
let currentBill = null;
let currentPaymentMethod = null;

export function initTagihan(appInstance) {
    app = appInstance;
    const section = document.getElementById('section-tagihan');
    if (!section) return;
    
    renderTagihanSection(section);
    setupTagihanEvents();
}

function renderTagihanSection(section) {
    section.innerHTML = `
        <div class="card">
            <div class="card-title">
                <i class="fas fa-file-invoice"></i>
                Bayar Tagihan
            </div>
            
            <div class="grid-4col" style="margin-bottom: 20px;">
                <button class="btn btn-outline btn-sm category-btn active" data-category="pln">
                    <i class="fas fa-bolt"></i> PLN
                </button>
                <button class="btn btn-outline btn-sm category-btn" data-category="pdam">
                    <i class="fas fa-droplet"></i> PDAM
                </button>
                <button class="btn btn-outline btn-sm category-btn" data-category="internet">
                    <i class="fas fa-wifi"></i> Internet
                </button>
                <button class="btn btn-outline btn-sm category-btn" data-category="seminar">
                    <i class="fas fa-chalkboard-user"></i> Seminar
                </button>
            </div>
            
            <div class="form-group">
                <label for="tagihanInput">Nomor Pelanggan / Referensi</label>
                <input type="text" id="tagihanInput" class="form-control" placeholder="Masukkan nomor pelanggan PLN" />
                <div class="error-message" id="tagihanError">Nomor harus 8-12 karakter alfanumerik</div>
            </div>
            
            <button class="btn" id="cekTagihanBtn">
                <i class="fas fa-search"></i> Cek Tagihan
            </button>
            
            <div id="tagihanLoading" style="display:none;"></div>
            <div id="tagihanResult" class="result-box" style="display:none;"></div>
        </div>
        
        <div id="tagihanPaymentMethod" class="card" style="display:none;">
            <h4 style="margin-bottom: 16px;">Pilih Metode Pembayaran</h4>
            <div class="grid-3col">
                <button class="btn btn-outline btn-sm method-btn" data-method="va">
                    <i class="fas fa-university"></i> Virtual Account
                </button>
                <button class="btn btn-outline btn-sm method-btn" data-method="qris">
                    <i class="fas fa-qrcode"></i> QRIS
                </button>
                <button class="btn btn-outline btn-sm method-btn" data-method="teller">
                    <i class="fas fa-building"></i> Teller / Kasir
                </button>
            </div>
            <div id="methodDetail" style="margin-top: 16px;"></div>
            <button class="btn btn-block" id="bayarTagihanBtn" style="margin-top: 16px;">
                <i class="fas fa-check"></i> Bayar Sekarang
            </button>
        </div>
    `;
}

function setupTagihanEvents() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            const input = document.getElementById('tagihanInput');
            input.placeholder = `Masukkan nomor pelanggan ${currentCategory.toUpperCase()}`;
            input.value = '';
            document.getElementById('tagihanResult').style.display = 'none';
            document.getElementById('tagihanPaymentMethod').style.display = 'none';
            document.getElementById('tagihanError').classList.remove('show');
        });
    });
    
    // Cek tagihan
    document.getElementById('cekTagihanBtn').addEventListener('click', cekTagihan);
    document.getElementById('tagihanInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cekTagihan();
    });
    
    // Method buttons
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPaymentMethod = btn.dataset.method;
            showMethodDetail(currentPaymentMethod);
        });
    });
    
    // Bayar
    document.getElementById('bayarTagihanBtn').addEventListener('click', bayarTagihan);
}

function cekTagihan() {
    const input = document.getElementById('tagihanInput');
    const id = input.value.trim();
    const error = document.getElementById('tagihanError');
    
    // Validasi
    if (!validatePelanggan(id)) {
        error.classList.add('show');
        input.classList.add('error');
        showToast('Format nomor tidak valid!', 'error');
        return;
    }
    error.classList.remove('show');
    input.classList.remove('error');
    
    // Cari data
    const data = billData[currentCategory]?.[id];
    if (!data) {
        showToast('Nomor pelanggan tidak ditemukan!', 'error');
        return;
    }
    
    // Simulasi loading
    showLoading('tagihanLoading');
    document.getElementById('tagihanResult').style.display = 'none';
    
    simulateApiCall(data, 1200).then(result => {
        hideLoading('tagihanLoading');
        currentBill = { category: currentCategory, id, ...result };
        renderTagihanResult(result);
        document.getElementById('tagihanPaymentMethod').style.display = 'block';
        showToast('Tagihan ditemukan!', 'success');
    });
}

function renderTagihanResult(data) {
    const result = document.getElementById('tagihanResult');
    const total = data.amount + (data.penalty || 0);
    
    result.style.display = 'block';
    result.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
                <div class="label">Nama Pelanggan</div>
                <div class="value">${data.name}</div>
            </div>
            <div>
                <div class="label">Alamat</div>
                <div class="value">${data.address}</div>
            </div>
            <div>
                <div class="label">Periode</div>
                <div class="value">${data.period}</div>
            </div>
            <div>
                <div class="label">Jatuh Tempo</div>
                <div class="value">${data.due}</div>
            </div>
            <div>
                <div class="label">Tagihan Pokok</div>
                <div class="value">${formatRupiah(data.amount)}</div>
            </div>
            <div>
                <div class="label">Denda</div>
                <div class="value" style="color: ${data.penalty > 0 ? '#dc2626' : 'inherit'}">
                    ${data.penalty > 0 ? formatRupiah(data.penalty) : 'Tidak ada'}
                </div>
            </div>
            <div style="grid-column: 1 / -1; border-top: 2px solid var(--gray-light); padding-top: 12px;">
                <div class="label" style="font-size: 1rem;">Total yang harus dibayar</div>
                <div class="value" style="font-size: 1.5rem; color: var(--primary);">
                    ${formatRupiah(total)}
                </div>
            </div>
        </div>
    `;
}

function showMethodDetail(method) {
    const detail = document.getElementById('methodDetail');
    
    if (method === 'va') {
        const vaNumber = '8888' + Math.floor(100000000 + Math.random() * 900000000);
        detail.innerHTML = `
            <div class="result-box">
                <h4 style="margin-bottom: 8px;">Virtual Account</h4>
                <p><strong>Nomor VA:</strong> ${vaNumber}</p>
                <p style="margin-top: 8px; font-size: 0.9rem; color: var(--text-light);">
                    Instruksi transfer ke bank berikut:
                </p>
                <ul style="margin-top: 4px; padding-left: 20px; color: var(--text-light);">
                    <li>BCA (Kode Bank: 014)</li>
                    <li>BNI (Kode Bank: 009)</li>
                    <li>Mandiri (Kode Bank: 008)</li>
                </ul>
                <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-light);">
                    <i class="fas fa-info-circle"></i> Gunakan nomor VA di atas untuk transfer
                </p>
            </div>
        `;
    } else if (method === 'qris') {
        detail.innerHTML = `
            <div class="qris-placeholder">
                <div id="qrisContainer" style="display:flex; justify-content:center;"></div>
                <p style="margin-top: 12px; font-weight: 600;">Scan QR Code untuk membayar</p>
                <p style="font-size: 0.85rem; color: var(--text-light);">
                    <i class="fas fa-clock"></i> QRIS berlaku 5 menit
                </p>
                <div id="qrisTimer" style="margin-top: 8px; font-weight: 700; color: var(--primary);">
                    05:00
                </div>
            </div>
        `;
        
        // Generate QR Code
        setTimeout(() => {
            const container = document.getElementById('qrisContainer');
            if (container && typeof QRCode !== 'undefined') {
                const qr = new QRCode(container, {
                    text: 'BAYARIN-QRIS-' + Date.now(),
                    width: 150,
                    height: 150,
                    colorDark: '#0b8a6e',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
                
                // Timer 5 menit
                let timeLeft = 300;
                const timerEl = document.getElementById('qrisTimer');
                const interval = setInterval(() => {
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        timerEl.textContent = 'Kadaluarsa';
                        timerEl.style.color = '#dc2626';
                        showToast('QRIS kadaluarsa, silahkan refresh', 'error');
                    }
                }, 1000);
            }
        }, 100);
    } else if (method === 'teller') {
        const code = 'TP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        detail.innerHTML = `
            <div class="result-box">
                <h4 style="margin-bottom: 8px;">Bayar di Teller / Kasir</h4>
                <p><strong>Kode Pembayaran:</strong> ${code}</p>
                <p style="margin-top: 8px; font-weight: 600;">Lokasi Kantor:</p>
                <ul style="padding-left: 20px; color: var(--text-light);">
                    <li>Jl. Sudirman No. 1, Jakarta Pusat</li>
                    <li>Jl. Diponegoro No. 45, Bandung</li>
                    <li>Jl. Pahlawan No. 12, Surabaya</li>
                </ul>
                <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-light);">
                    <i class="fas fa-clock"></i> Jam operasional: 08:00 - 17:00 WIB
                </p>
            </div>
        `;
    }
}

function bayarTagihan() {
    if (!currentBill) {
        showToast('Cek tagihan terlebih dahulu!', 'error');
        return;
    }
    
    if (!currentPaymentMethod) {
        showToast('Pilih metode pembayaran!', 'error');
        return;
    }
    
    const total = currentBill.amount + (currentBill.penalty || 0);
    
    // Proses pembayaran
    processPayment(app, 'tagihan', {
        ...currentBill,
        total: total,
        method: currentPaymentMethod
    });
}