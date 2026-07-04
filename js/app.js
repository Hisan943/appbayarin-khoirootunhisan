// ============================================
// MAIN APPLICATION - Bayarin
// ============================================

// ===== STATE =====
let state = loadFromLocalStorage('bayarin', {
    saldo: 4250000,
    history: []
});

let saldo = state.saldo;
let history = state.history;
let currentSection = 'dashboard';

// ===== DOM ELEMENTS =====
const sections = document.querySelectorAll('.section');
const navBtns = document.querySelectorAll('.nav-btn');
const saldoDisplay = document.getElementById('saldoDisplay');

// ============================================
// THEME MANAGEMENT
// ============================================
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
    
    showToast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'}`, 'info');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    html.setAttribute('data-theme', savedTheme);
    
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// ============================================
// NAVIGATION
// ============================================
function navigate(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');
    
    navBtns.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    currentSection = sectionId;
    
    if (sectionId === 'riwayat') renderRiwayat();
    if (sectionId === 'dashboard') renderDashboard();
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navigate(btn.dataset.section);
    });
});

// ============================================
// SALDO FUNCTIONS
// ============================================
function updateSaldo() {
    saldoDisplay.textContent = formatRupiah(saldo);
    saveState();
}

function deductSaldo(amount) {
    if (saldo < amount) {
        showToast('Saldo tidak cukup!', 'error');
        return false;
    }
    saldo -= amount;
    updateSaldo();
    return true;
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================
function addTransaction(transaction) {
    const newTransaction = {
        id: Date.now().toString(36),
        date: new Date().toISOString(),
        ...transaction
    };
    history.unshift(newTransaction);
    saveState();
    renderRiwayat();
    renderDashboard();
    return newTransaction;
}

function clearHistory() {
    if (history.length === 0) {
        showToast('Tidak ada riwayat', 'info');
        return;
    }
    if (confirm('Yakin hapus semua riwayat?')) {
        history = [];
        saveState();
        renderRiwayat();
        renderDashboard();
        showToast('Riwayat dihapus', 'success');
    }
}

function saveState() {
    state.saldo = saldo;
    state.history = history;
    saveToLocalStorage('bayarin', state);
}

// ============================================
// SHOW STRUK / BUKTI PEMBAYARAN
// ============================================
function showStruk(data) {
    const modal = document.getElementById('strukModal');
    const content = document.getElementById('strukContent');
    
    const methodLabels = {
        'va': 'Virtual Account',
        'qris': 'QRIS',
        'teller': 'Teller / Kasir'
    };
    
    const methodIcons = {
        'va': 'fa-university',
        'qris': 'fa-qrcode',
        'teller': 'fa-building'
    };
    
    let methodDetail = '';
    if (data.method === 'va') {
        const vaNumber = generateVA();
        methodDetail = `
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 12px; margin: 8px 0;">
                <div style="font-size: 0.85rem; color: var(--text-light);">Nomor Virtual Account</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary); letter-spacing: 2px;">${vaNumber}</div>
                <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 4px;">
                    <i class="fas fa-info-circle"></i> Transfer ke BCA / BNI / Mandiri
                </div>
            </div>
        `;
    } else if (data.method === 'qris') {
        methodDetail = `
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 12px; margin: 8px 0; text-align: center;">
                <div id="qrisStrukContainer" style="display: flex; justify-content: center; margin: 8px 0;"></div>
                <div style="font-size: 0.85rem; color: var(--text-light);">
                    <i class="fas fa-clock"></i> Scan QR Code untuk pembayaran
                </div>
                <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 4px;">
                    Berlaku 5 menit
                </div>
            </div>
        `;
        setTimeout(() => {
            const container = document.getElementById('qrisStrukContainer');
            if (container && typeof QRCode !== 'undefined') {
                new QRCode(container, {
                    text: 'BAYARIN-QRIS-' + Date.now(),
                    width: 120,
                    height: 120,
                    colorDark: '#0b8a6e',
                    colorLight: '#ffffff'
                });
            }
        }, 100);
    } else if (data.method === 'teller') {
        const tellerCode = generateTellerCode();
        methodDetail = `
            <div style="background: var(--bg-secondary); padding: 12px; border-radius: 12px; margin: 8px 0;">
                <div style="font-size: 0.85rem; color: var(--text-light);">Kode Pembayaran</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary); letter-spacing: 2px;">${tellerCode}</div>
                <div style="font-size: 0.8rem; color: var(--text-light); margin-top: 4px;">
                    <i class="fas fa-map-pin"></i> Bayar di kantor terdekat
                </div>
                <div style="font-size: 0.8rem; color: var(--text-light);">
                    <i class="fas fa-clock"></i> Jam operasional: 08:00 - 17:00 WIB
                </div>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div style="text-align: center; font-size: 1.2rem; font-weight: 700; color: var(--primary); margin-bottom: 12px;">
            <i class="fas fa-receipt"></i> ${data.type}
        </div>
        <div style="border-top: 2px dashed var(--border); margin: 8px 0;"></div>
        
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: var(--text-light);">Tanggal</span>
            <span>${formatDate(data.date)}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: var(--text-light);">Deskripsi</span>
            <span style="font-weight: 600;">${data.desc}</span>
        </div>
        
        ${data.name ? `
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: var(--text-light);">Pelanggan</span>
            <span>${data.name}</span>
        </div>
        ` : ''}
        
        ${data.phone ? `
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: var(--text-light);">Nomor HP</span>
            <span>${data.phone}</span>
        </div>
        ` : ''}
        
        ${data.provider ? `
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: var(--text-light);">Provider</span>
            <span>${data.provider}</span>
        </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
            <span style="color: var(--text-light);">Metode</span>
            <span><i class="fas ${methodIcons[data.method]}"></i> ${methodLabels[data.method] || data.method}</span>
        </div>
        
        ${methodDetail}
        
        <div style="border-top: 2px dashed var(--border); margin: 8px 0;"></div>
        
        <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 1.2rem; font-weight: 700; color: var(--primary);">
            <span>Total Dibayar</span>
            <span>${formatRupiah(data.total)}</span>
        </div>
        
        <div style="border-top: 2px dashed var(--border); margin: 8px 0;"></div>
        
        <div style="text-align: center; color: var(--text-light); font-size: 0.85rem;">
            <i class="fas fa-check-circle" style="color: var(--primary);"></i> 
            Pembayaran berhasil • Status: Lunas
        </div>
        <div style="text-align: center; color: var(--text-light); font-size: 0.75rem; margin-top: 4px;">
            <i class="fas fa-hashtag"></i> Kode: TRX-${Date.now().toString(36).toUpperCase()}
        </div>
    `;
    
    modal.classList.add('show');
}

// ============================================
// RENDER DASHBOARD
// ============================================
function renderDashboard() {
    const section = document.getElementById('section-dashboard');
    const totalTransaksi = history.length;
    const totalPengeluaran = history.reduce((sum, t) => sum + t.total, 0);
    
    section.innerHTML = `
        <div class="card">
            <div class="card-title"><i class="fas fa-bolt"></i> Bayar Cepat</div>
            <div class="grid-3col">
                <div class="category-card" onclick="navigate('tagihan')">
                    <i class="fas fa-file-invoice"></i>
                    <span>Tagihan</span>
                    <small style="color: var(--text-light);">PLN, PDAM, Internet</small>
                </div>
                <div class="category-card" onclick="navigate('spp')">
                    <i class="fas fa-graduation-cap"></i>
                    <span>SPP Kuliah</span>
                    <small style="color: var(--text-light);">Cicilan Semester</small>
                </div>
                <div class="category-card" onclick="navigate('pulsa')">
                    <i class="fas fa-sim-card"></i>
                    <span>Pulsa & Paket</span>
                    <small style="color: var(--text-light);">Semua Provider</small>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title"><i class="fas fa-tag" style="color: #f59e0b;"></i> Promo Spesial</div>
            <div style="background: var(--promo-bg); padding: 16px 20px; border-radius: 16px; transition: background var(--transition);">
                <h4 style="color: var(--promo-text);"><i class="fas fa-gift"></i> Cashback 5% untuk Pembayaran Pertama</h4>
                <p style="color: var(--promo-text); margin-top: 4px; opacity: 0.8;">Maksimal cashback Rp 25.000 untuk semua kategori</p>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title"><i class="fas fa-chart-simple"></i> Ringkasan</div>
            <div class="grid-3col">
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 16px; text-align: center; transition: background var(--transition);">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Transaksi</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${totalTransaksi}</div>
                </div>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 16px; text-align: center; transition: background var(--transition);">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Total Pengeluaran</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${formatRupiah(totalPengeluaran)}</div>
                </div>
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 16px; text-align: center; transition: background var(--transition);">
                    <div style="font-size: 0.85rem; color: var(--text-light);">Saldo Tersisa</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${formatRupiah(saldo)}</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// RENDER TAGIHAN
// ============================================
let currentCategory = 'pln';
let currentBill = null;
let currentPaymentMethod = null;

function renderTagihan() {
    const section = document.getElementById('section-tagihan');
    section.innerHTML = `
        <div class="card">
            <div class="card-title"><i class="fas fa-file-invoice"></i> Bayar Tagihan</div>
            
            <div class="grid-4col" style="margin-bottom: 16px;">
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
                <label>Nomor Pelanggan</label>
                <input type="text" id="tagihanInput" class="form-control" placeholder="Masukkan nomor pelanggan PLN" />
                <div class="error-message" id="tagihanError">Nomor harus 8-12 karakter alfanumerik</div>
            </div>
            
            <button class="btn" id="cekTagihanBtn"><i class="fas fa-search"></i> Cek Tagihan</button>
            
            <div id="tagihanLoading" style="display:none;"></div>
            <div id="tagihanResult" class="result-box" style="display:none;"></div>
        </div>
        
        <div id="tagihanPaymentMethod" class="card" style="display:none;">
            <h4 style="margin-bottom: 12px;">Pilih Metode Pembayaran</h4>
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
            <div id="methodDetail" style="margin-top: 12px;"></div>
            <button class="btn btn-block" id="bayarTagihanBtn" style="margin-top: 12px;">
                <i class="fas fa-check"></i> Bayar Sekarang
            </button>
        </div>
    `;
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            document.getElementById('tagihanInput').placeholder = `Masukkan nomor pelanggan ${currentCategory.toUpperCase()}`;
            document.getElementById('tagihanInput').value = '';
            document.getElementById('tagihanResult').style.display = 'none';
            document.getElementById('tagihanPaymentMethod').style.display = 'none';
            document.getElementById('methodDetail').innerHTML = '';
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            currentPaymentMethod = null;
        };
    });
    
    document.getElementById('cekTagihanBtn').onclick = cekTagihan;
    document.getElementById('tagihanInput').onkeypress = (e) => { if (e.key === 'Enter') cekTagihan(); };
    
    // Method buttons
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPaymentMethod = this.dataset.method;
            showMethodDetailTagihan(currentPaymentMethod);
        };
    });
    
    document.getElementById('bayarTagihanBtn').onclick = bayarTagihan;
}

function cekTagihan() {
    const input = document.getElementById('tagihanInput');
    const id = input.value.trim();
    const error = document.getElementById('tagihanError');
    
    if (!validatePelanggan(id)) {
        error.classList.add('show');
        input.classList.add('error');
        showToast('Format nomor tidak valid!', 'error');
        return;
    }
    error.classList.remove('show');
    input.classList.remove('error');
    
    const data = billData[currentCategory]?.[id];
    if (!data) {
        showToast('Nomor tidak ditemukan!', 'error');
        return;
    }
    
    showLoading('tagihanLoading');
    document.getElementById('tagihanResult').style.display = 'none';
    
    simulateApiCall(data, 1200).then(result => {
        hideLoading('tagihanLoading');
        currentBill = { category: currentCategory, id, ...result };
        
        const resultDiv = document.getElementById('tagihanResult');
        const total = result.amount + (result.penalty || 0);
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="display: grid; gap: 4px;">
                <div><strong>${result.name}</strong></div>
                <div style="color: var(--text-light);">${result.address}</div>
                <div>Periode: ${result.period}</div>
                <div>Tagihan Pokok: ${formatRupiah(result.amount)}</div>
                ${result.penalty ? `<div style="color:#dc2626;">Denda: ${formatRupiah(result.penalty)}</div>` : ''}
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); margin-top: 4px;">
                    Total: ${formatRupiah(total)}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-light);">
                    <i class="fas fa-calendar"></i> Jatuh tempo: ${result.due}
                </div>
            </div>
        `;
        
        document.getElementById('tagihanPaymentMethod').style.display = 'block';
        document.getElementById('methodDetail').innerHTML = '';
        document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
        currentPaymentMethod = null;
        showToast('Tagihan ditemukan!', 'success');
    });
}

function showMethodDetailTagihan(method) {
    const detail = document.getElementById('methodDetail');
    
    if (method === 'va') {
        const vaNumber = generateVA();
        detail.innerHTML = `
            <div class="result-box">
                <h4 style="margin-bottom: 8px;"><i class="fas fa-university"></i> Virtual Account</h4>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary); letter-spacing: 2px; margin: 8px 0;">
                    ${vaNumber}
                </div>
                <div style="font-size: 0.9rem; color: var(--text-light);">
                    <i class="fas fa-info-circle"></i> Transfer ke bank berikut:
                </div>
                <ul style="margin-top: 4px; padding-left: 20px; color: var(--text-light); font-size: 0.9rem;">
                    <li>BCA (Kode Bank: 014)</li>
                    <li>BNI (Kode Bank: 009)</li>
                    <li>Mandiri (Kode Bank: 008)</li>
                </ul>
                <div style="margin-top: 8px; font-size: 0.85rem; background: var(--promo-bg); padding: 8px 12px; border-radius: 8px; color: var(--promo-text);">
                    <i class="fas fa-clock"></i> Gunakan nomor VA di atas untuk transfer
                </div>
            </div>
        `;
    } else if (method === 'qris') {
        detail.innerHTML = `
            <div class="result-box">
                <h4 style="margin-bottom: 8px;"><i class="fas fa-qrcode"></i> QRIS</h4>
                <div class="qris-placeholder">
                    <div id="qrisContainer" style="display: flex; justify-content: center;"></div>
                    <p style="margin-top: 8px; font-weight: 600;">Scan QR Code untuk membayar</p>
                    <p style="font-size: 0.85rem; color: var(--text-light);">
                        <i class="fas fa-clock"></i> QRIS berlaku 5 menit
                    </p>
                    <div id="qrisTimer" style="margin-top: 8px; font-weight: 700; color: var(--primary); font-size: 1.1rem;">
                        05:00
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const container = document.getElementById('qrisContainer');
            if (container && typeof QRCode !== 'undefined') {
                new QRCode(container, {
                    text: 'BAYARIN-QRIS-' + Date.now(),
                    width: 150,
                    height: 150,
                    colorDark: '#0b8a6e',
                    colorLight: '#ffffff'
                });
                
                let timeLeft = 300;
                const timerEl = document.getElementById('qrisTimer');
                const interval = setInterval(() => {
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        timerEl.textContent = '⏰ Kadaluarsa';
                        timerEl.style.color = '#dc2626';
                        showToast('QRIS kadaluarsa, silahkan refresh', 'error');
                    }
                }, 1000);
            }
        }, 100);
    } else if (method === 'teller') {
        const tellerCode = generateTellerCode();
        detail.innerHTML = `
            <div class="result-box">
                <h4 style="margin-bottom: 8px;"><i class="fas fa-building"></i> Bayar di Teller / Kasir</h4>
                <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary); letter-spacing: 2px; margin: 8px 0;">
                    ${tellerCode}
                </div>
                <div style="font-weight: 600; margin-top: 8px;">📍 Lokasi Kantor:</div>
                <ul style="padding-left: 20px; color: var(--text-light); font-size: 0.9rem;">
                    <li>Jl. Sudirman No. 1, Jakarta Pusat</li>
                    <li>Jl. Diponegoro No. 45, Bandung</li>
                    <li>Jl. Pahlawan No. 12, Surabaya</li>
                </ul>
                <div style="margin-top: 8px; font-size: 0.85rem; background: var(--bg-secondary); padding: 8px 12px; border-radius: 8px; color: var(--text-light);">
                    <i class="fas fa-clock"></i> Jam operasional: 08:00 - 17:00 WIB (Senin-Jumat)
                </div>
            </div>
        `;
    }
}

function bayarTagihan() {
    if (!currentBill) {
        showToast('Cek tagihan dulu!', 'error');
        return;
    }
    if (!currentPaymentMethod) {
        showToast('Pilih metode pembayaran!', 'error');
        return;
    }
    
    const total = currentBill.amount + (currentBill.penalty || 0);
    if (!deductSaldo(total)) return;
    
    const transaction = {
        type: 'Tagihan',
        desc: `${currentBill.category.toUpperCase()} - ${currentBill.name}`,
        total: total,
        status: 'Lunas'
    };
    addTransaction(transaction);
    
    showStruk({
        type: 'Tagihan',
        desc: transaction.desc,
        total: total,
        method: currentPaymentMethod,
        date: new Date().toISOString(),
        name: currentBill.name,
        address: currentBill.address
    });
    
    currentBill = null;
    currentPaymentMethod = null;
    document.getElementById('tagihanResult').style.display = 'none';
    document.getElementById('tagihanPaymentMethod').style.display = 'none';
    document.getElementById('methodDetail').innerHTML = '';
    document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
    showToast('Pembayaran berhasil!', 'success');
}

// ============================================
// RENDER SPP
// ============================================
let currentNIM = null;
let currentSPPData = null;

function renderSPP() {
    const section = document.getElementById('section-spp');
    section.innerHTML = `
        <div class="card">
            <div class="card-title"><i class="fas fa-graduation-cap"></i> Cicilan Biaya Kuliah / SPP</div>
            
            <div class="form-group">
                <label>NIM (12 digit)</label>
                <input type="text" id="nimInput" class="form-control" placeholder="cth: 202310001234" maxlength="12" />
                <div class="error-message" id="nimError">NIM harus 12 digit angka</div>
            </div>
            
            <button class="btn" id="cekNimBtn"><i class="fas fa-search"></i> Lihat Tagihan Semester</button>
            
            <div id="sppLoading" style="display:none;"></div>
            <div id="sppResult" style="margin-top: 16px;"></div>
        </div>
    `;
    
    document.getElementById('cekNimBtn').onclick = cekNIM;
    document.getElementById('nimInput').onkeypress = (e) => { if (e.key === 'Enter') cekNIM(); };
}

function cekNIM() {
    const input = document.getElementById('nimInput');
    const nim = input.value.trim();
    const error = document.getElementById('nimError');
    
    if (!validateNIM(nim)) {
        error.classList.add('show');
        input.classList.add('error');
        showToast('NIM tidak valid!', 'error');
        return;
    }
    error.classList.remove('show');
    input.classList.remove('error');
    
    const data = billData.spp[nim];
    if (!data) {
        showToast('NIM tidak terdaftar!', 'error');
        return;
    }
    
    currentNIM = nim;
    currentSPPData = data;
    
    showLoading('sppLoading');
    document.getElementById('sppResult').innerHTML = '';
    
    simulateApiCall(data, 1000).then(() => {
        hideLoading('sppLoading');
        renderSPPResult(data);
        showToast('Data ditemukan!', 'success');
    });
}

function renderSPPResult(data) {
    const container = document.getElementById('sppResult');
    let html = `
        <div class="result-box">
            <h4 style="margin-bottom: 12px;">📋 Daftar Cicilan Semester</h4>
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Deskripsi</th>
                            <th>Jumlah</th>
                            <th>Status</th>
                            <th>Pilih</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    data.forEach((item, index) => {
        const isPaid = item.status === 'paid';
        const checked = isPaid ? 'checked disabled' : '';
        const statusClass = isPaid ? 'badge-paid' : 'badge-unpaid';
        const statusText = isPaid ? 'Lunas' : 'Belum Lunas';
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.desc}</td>
                <td>${formatRupiah(item.amount)}</td>
                <td><span class="badge-status ${statusClass}">${statusText}</span></td>
                <td>
                    <input type="checkbox" class="spp-checkbox" data-index="${index}" ${checked} ${isPaid ? 'disabled' : ''} />
                </td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <span style="color: var(--text-light);">Total terpilih:</span>
                    <span id="sppTotal" style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">Rp 0</span>
                </div>
                <button class="btn" id="bayarSppBtn"><i class="fas fa-check"></i> Bayar Terpilih</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    document.querySelectorAll('.spp-checkbox').forEach(cb => {
        cb.onchange = updateSPPTotal;
    });
    document.getElementById('bayarSppBtn').onclick = bayarSPP;
    updateSPPTotal();
}

function updateSPPTotal() {
    const checkboxes = document.querySelectorAll('.spp-checkbox:checked');
    let total = 0;
    checkboxes.forEach(cb => {
        const index = parseInt(cb.dataset.index);
        if (currentSPPData && currentSPPData[index]) {
            total += currentSPPData[index].amount;
        }
    });
    document.getElementById('sppTotal').textContent = formatRupiah(total);
}

function bayarSPP() {
    const checkboxes = document.querySelectorAll('.spp-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast('Pilih minimal satu cicilan!', 'error');
        return;
    }
    
    showPaymentMethodSelector('spp');
}

function processSPPPayment(method) {
    const checkboxes = document.querySelectorAll('.spp-checkbox:checked');
    let total = 0;
    const selected = [];
    checkboxes.forEach(cb => {
        const index = parseInt(cb.dataset.index);
        if (currentSPPData && currentSPPData[index]) {
            total += currentSPPData[index].amount;
            selected.push(currentSPPData[index]);
        }
    });
    
    if (!deductSaldo(total)) return;
    
    const transaction = {
        type: 'SPP',
        desc: `Pembayaran ${selected.length} cicilan SPP (NIM: ${currentNIM})`,
        total: total,
        status: 'Lunas'
    };
    addTransaction(transaction);
    
    selected.forEach(item => item.status = 'paid');
    
    showStruk({
        type: 'SPP',
        desc: transaction.desc,
        total: total,
        method: method,
        date: new Date().toISOString(),
        nim: currentNIM
    });
    
    renderSPPResult(currentSPPData);
    showToast('Pembayaran berhasil!', 'success');
}

// ============================================
// RENDER PULSA
// ============================================
let selectedProvider = null;
let selectedNominal = 0;

function renderPulsa() {
    const section = document.getElementById('section-pulsa');
    section.innerHTML = `
        <div class="card">
            <div class="card-title"><i class="fas fa-sim-card"></i> Isi Pulsa & Paket Data</div>
            
            <div class="form-group">
                <label>Pilih Provider</label>
                <div class="grid-3col" id="providerGrid">
                    <div class="provider-card" data-provider="Telkomsel">
                        <i class="fas fa-circle" style="color:#e21e2e;"></i>
                        <span>Telkomsel</span>
                    </div>
                    <div class="provider-card" data-provider="XL">
                        <i class="fas fa-circle" style="color:#0066b3;"></i>
                        <span>XL</span>
                    </div>
                    <div class="provider-card" data-provider="Indosat">
                        <i class="fas fa-circle" style="color:#e31e2e;"></i>
                        <span>Indosat</span>
                    </div>
                    <div class="provider-card" data-provider="Tri">
                        <i class="fas fa-circle" style="color:#5b2b8a;"></i>
                        <span>Tri</span>
                    </div>
                    <div class="provider-card" data-provider="Smartfren">
                        <i class="fas fa-circle" style="color:#ed1c24;"></i>
                        <span>Smartfren</span>
                    </div>
                    <div class="provider-card" data-provider="Axis">
                        <i class="fas fa-circle" style="color:#f47721;"></i>
                        <span>Axis</span>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Nomor HP</label>
                <input id="hpInput" class="form-control" placeholder="cth: 08123456789" maxlength="13" />
                <div class="error-message" id="hpError">Nomor HP harus 10-13 digit dan dimulai dengan 08</div>
            </div>
            
            <div class="form-group">
                <label>Nominal Pulsa</label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0;">
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="10000">Rp 10k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="25000">Rp 25k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="50000">Rp 50k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="100000">Rp 100k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="200000">Rp 200k</button>
                </div>
                <input id="nominalInput" class="form-control" placeholder="atau masukkan nominal lainnya" />
                <div class="error-message" id="nominalError">Masukkan nominal yang valid</div>
            </div>
            
            <button class="btn btn-block" id="cekPulsaBtn"><i class="fas fa-arrow-right"></i> Preview & Bayar</button>
            
            <div id="pulsaPreview" style="margin-top: 16px;"></div>
        </div>
    `;
    
    // Provider selection
    document.querySelectorAll('.provider-card').forEach(card => {
        card.onclick = function() {
            document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedProvider = this.dataset.provider;
            showToast('Provider: ' + selectedProvider, 'info');
        };
    });
    
    // Nominal buttons
    document.querySelectorAll('.nominal-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedNominal = parseInt(this.dataset.nominal);
            document.getElementById('nominalInput').value = selectedNominal;
        };
    });
    
    document.getElementById('nominalInput').oninput = function() {
        const val = parseInt(this.value);
        if (val > 0) {
            selectedNominal = val;
            document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('active'));
        }
    };
    
    document.getElementById('cekPulsaBtn').onclick = previewPulsa;
    document.getElementById('hpInput').onkeypress = (e) => { if (e.key === 'Enter') previewPulsa(); };
}

function previewPulsa() {
    const phone = document.getElementById('hpInput').value.trim();
    const hpError = document.getElementById('hpError');
    const nominalError = document.getElementById('nominalError');
    
    if (!validatePhone(phone)) {
        hpError.classList.add('show');
        document.getElementById('hpInput').classList.add('error');
        showToast('Nomor HP tidak valid!', 'error');
        return;
    }
    hpError.classList.remove('show');
    document.getElementById('hpInput').classList.remove('error');
    
    if (!selectedNominal || selectedNominal < 1000) {
        nominalError.classList.add('show');
        showToast('Masukkan nominal yang valid!', 'error');
        return;
    }
    nominalError.classList.remove('show');
    
    const detectedProvider = detectProvider(phone);
    if (!selectedProvider && detectedProvider) {
        selectedProvider = detectedProvider;
        document.querySelectorAll('.provider-card').forEach(c => {
            if (c.dataset.provider === selectedProvider) {
                c.classList.add('active');
            }
        });
    }
    
    if (!selectedProvider) {
        showToast('Pilih provider terlebih dahulu!', 'error');
        return;
    }
    
    const preview = document.getElementById('pulsaPreview');
    preview.innerHTML = `
        <div class="result-box">
            <h4 style="margin-bottom: 8px;">📱 Preview Pembayaran</h4>
            <div style="display: grid; gap: 6px;">
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-light);">Provider</span>
                    <strong>${selectedProvider}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-light);">Nomor Tujuan</span>
                    <strong>${phone}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--border);">
                    <span style="color: var(--text-light);">Nominal</span>
                    <strong>${formatRupiah(selectedNominal)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 1.1rem; font-weight: 700; color: var(--primary);">
                    <span>Total</span>
                    <span>${formatRupiah(selectedNominal)}</span>
                </div>
            </div>
            <div style="margin-top: 12px;">
                <label style="font-weight: 600; display: block; margin-bottom: 8px;">Pilih Metode Pembayaran:</label>
                <div class="grid-3col">
                    <button class="btn btn-outline btn-sm pulsa-method-btn" data-method="va">
                        <i class="fas fa-university"></i> VA
                    </button>
                    <button class="btn btn-outline btn-sm pulsa-method-btn" data-method="qris">
                        <i class="fas fa-qrcode"></i> QRIS
                    </button>
                    <button class="btn btn-outline btn-sm pulsa-method-btn" data-method="teller">
                        <i class="fas fa-building"></i> Teller
                    </button>
                </div>
            </div>
            <button class="btn btn-block" id="bayarPulsaBtn" style="margin-top: 12px;" disabled>
                <i class="fas fa-check"></i> Konfirmasi Pembayaran
            </button>
        </div>
    `;
    
    let selectedMethod = null;
    document.querySelectorAll('.pulsa-method-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.pulsa-method-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedMethod = this.dataset.method;
            document.getElementById('bayarPulsaBtn').disabled = false;
            document.getElementById('bayarPulsaBtn').innerHTML = `<i class="fas fa-check"></i> Bayar dengan ${this.textContent.trim()}`;
            showToast('Metode: ' + this.textContent.trim(), 'info');
        };
    });
    
    document.getElementById('bayarPulsaBtn').onclick = function() {
        if (!selectedMethod) {
            showToast('Pilih metode pembayaran!', 'error');
            return;
        }
        if (!deductSaldo(selectedNominal)) return;
        
        const transaction = {
            type: 'Pulsa',
            desc: `Isi Pulsa ${selectedProvider} - ${phone}`,
            total: selectedNominal,
            status: 'Lunas'
        };
        addTransaction(transaction);
        
        showStruk({
            type: 'Pulsa',
            desc: transaction.desc,
            total: selectedNominal,
            method: selectedMethod,
            date: new Date().toISOString(),
            phone: phone,
            provider: selectedProvider
        });
        
        document.getElementById('pulsaPreview').innerHTML = '';
        document.getElementById('hpInput').value = '';
        document.getElementById('nominalInput').value = '';
        selectedProvider = null;
        selectedNominal = 0;
        document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('active'));
        showToast('Pembayaran berhasil!', 'success');
    };
}

// ============================================
// PAYMENT METHOD SELECTOR (untuk SPP)
// ============================================
function showPaymentMethodSelector(type) {
    const modal = document.getElementById('strukModal');
    const content = document.getElementById('strukContent');
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px;">
            <h3 style="color: var(--primary);"><i class="fas fa-credit-card"></i> Pilih Metode Pembayaran</h3>
            <p style="color: var(--text-light);">Pilih metode untuk menyelesaikan pembayaran</p>
        </div>
        <div style="display: grid; gap: 12px;">
            <button class="btn btn-block payment-method-select" data-method="va">
                <i class="fas fa-university"></i> Virtual Account
            </button>
            <button class="btn btn-block payment-method-select" data-method="qris">
                <i class="fas fa-qrcode"></i> QRIS
            </button>
            <button class="btn btn-block payment-method-select" data-method="teller">
                <i class="fas fa-building"></i> Teller / Kasir
            </button>
        </div>
        <div style="margin-top: 12px; text-align: center;">
            <button class="btn btn-outline" id="cancelPaymentBtn">Batal</button>
        </div>
    `;
    
    modal.classList.add('show');
    
    document.querySelectorAll('.payment-method-select').forEach(btn => {
        btn.onclick = function() {
            const method = this.dataset.method;
            modal.classList.remove('show');
            if (type === 'spp') {
                processSPPPayment(method);
            }
        };
    });
    
    document.getElementById('cancelPaymentBtn').onclick = function() {
        modal.classList.remove('show');
    };
}

// ============================================
// RENDER RIWAYAT
// ============================================
function renderRiwayat() {
    const tbody = document.getElementById('riwayatBody');
    if (!tbody) return;
    
    if (history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 8px;"></i>
                    Belum ada transaksi
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
}

// ============================================
// INIT RIWAYAT SECTION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('section-riwayat');
    section.innerHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
                <div class="card-title" style="margin-bottom: 0;">
                    <i class="fas fa-clock-rotate-left"></i> Riwayat Transaksi
                </div>
                <button class="btn btn-danger btn-sm" id="clearHistoryBtn">
                    <i class="fas fa-trash"></i> Hapus Semua
                </button>
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
    `;
    
    document.getElementById('clearHistoryBtn').onclick = clearHistory;
    renderRiwayat();
});

// ============================================
// MODAL EVENTS
// ============================================
document.getElementById('closeModalBtn').onclick = () => {
    document.getElementById('strukModal').classList.remove('show');
};
document.getElementById('closeModalBtn2').onclick = () => {
    document.getElementById('strukModal').classList.remove('show');
};
document.getElementById('printStrukBtn').onclick = () => {
    window.print();
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const sections = ['dashboard', 'tagihan', 'spp', 'pulsa', 'riwayat'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) navigate(sections[index]);
    }
    if (e.key === 'Escape') {
        document.getElementById('strukModal').classList.remove('show');
    }
});

// ============================================
// THEME TOGGLE EVENT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
});

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL
// ============================================
window.navigate = navigate;
window.toggleTheme = toggleTheme;

// ============================================
// INIT APPLICATION
// ============================================
function init() {
    loadTheme();
    
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
    
    renderDashboard();
    renderTagihan();
    renderSPP();
    renderPulsa();
    updateSaldo();
    navigate('dashboard');
    
    console.log('Bayarin v1.0 - Dark/Light Mode Ready!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}