// ===== PAYMENT MODULE =====

import {
    showToast,
    showLoading,
    hideLoading,
    simulateApiCall,
    formatRupiah,
    generateVA,
    generateTellerCode
} from '../utils.js';

export function processPayment(app, type, data) {
    // Validasi saldo
    if (!app.deductSaldo(data.total)) {
        return;
    }
    
    // Show loading
    showToast('Memproses pembayaran...', 'info');
    showLoading('app');
    
    // Simulasi proses pembayaran
    simulateApiCall(data, 2000).then(result => {
        hideLoading('app');
        
        // Buat transaksi
        const transaction = {
            type: getTransactionType(type),
            desc: data.desc || getDescription(type, data),
            total: data.total,
            status: 'Lunas'
        };
        
        app.addTransaction(transaction);
        
        // Tampilkan struk
        showStruk({
            type: getTransactionType(type),
            desc: transaction.desc,
            total: data.total,
            method: data.method || 'va',
            date: new Date().toISOString(),
            ...data
        });
        
        showToast('Pembayaran berhasil!', 'success');
    }).catch(error => {
        hideLoading('app');
        showToast('Pembayaran gagal, coba lagi', 'error');
        console.error('Payment error:', error);
    });
}

function getTransactionType(type) {
    const types = {
        'tagihan': 'Tagihan',
        'spp': 'SPP',
        'pulsa': 'Pulsa'
    };
    return types[type] || 'Transaksi';
}

function getDescription(type, data) {
    switch(type) {
        case 'tagihan':
            return `${data.category?.toUpperCase()} - ${data.name}`;
        case 'spp':
            return `Pembayaran ${data.items?.length || 0} cicilan SPP`;
        case 'pulsa':
            return `Isi Pulsa ${data.provider} - ${data.phone}`;
        default:
            return 'Pembayaran';
    }
}

function showStruk(data) {
    const modal = document.getElementById('strukModal');
    const content = document.getElementById('strukContent');
    
    const methodLabels = {
        'va': 'Virtual Account',
        'qris': 'QRIS',
        'teller': 'Teller / Kasir'
    };
    
    let methodDetail = '';
    if (data.method === 'va') {
        methodDetail = `<p><strong>Nomor VA:</strong> ${generateVA()}</p>`;
    } else if (data.method === 'teller') {
        methodDetail = `<p><strong>Kode Bayar:</strong> ${generateTellerCode()}</p>`;
    } else if (data.method === 'qris') {
        methodDetail = `<p><strong>QR Code:</strong> <i class="fas fa-qrcode"></i> Telah discan</p>`;
    }
    
    content.innerHTML = `
        <div class="struk-title">${data.type}</div>
        <div class="struk-divider"></div>
        
        <div class="struk-row">
            <span class="struk-label">Tanggal</span>
            <span>${new Date(data.date).toLocaleString('id-ID')}</span>
        </div>
        
        <div class="struk-row">
            <span class="struk-label">Deskripsi</span>
            <span>${data.desc}</span>
        </div>
        
        ${data.phone ? `
        <div class="struk-row">
            <span class="struk-label">Nomor HP</span>
            <span>${data.phone}</span>
        </div>
        ` : ''}
        
        ${data.name ? `
        <div class="struk-row">
            <span class="struk-label">Pelanggan</span>
            <span>${data.name}</span>
        </div>
        ` : ''}
        
        <div class="struk-row">
            <span class="struk-label">Metode</span>
            <span>${methodLabels[data.method] || data.method}</span>
        </div>
        
        ${methodDetail}
        
        <div class="struk-divider"></div>
        
        <div class="struk-row struk-total">
            <span>Total Dibayar</span>
            <span>${formatRupiah(data.total)}</span>
        </div>
        
        <div class="struk-divider"></div>
        
        <div style="text-align: center; color: var(--text-light); font-size: 0.85rem; margin-top: 12px;">
            <i class="fas fa-check-circle" style="color: var(--primary);"></i>
            Pembayaran berhasil • ${data.status || 'Lunas'}
        </div>
        <div style="text-align: center; color: var(--text-light); font-size: 0.75rem; margin-top: 8px;">
            Kode Transaksi: ${data.id || 'TRX-' + Date.now().toString(36).toUpperCase()}
        </div>
    `;
    
    modal.classList.add('show');
    
    // Print button
    document.getElementById('printStrukBtn').onclick = () => {
        window.print();
    };
}

// Show loading overlay
export function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (containerId === 'app') {
        // Global loading
        const overlay = document.createElement('div');
        overlay.id = 'globalLoading';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        overlay.innerHTML = `
            <div class="spinner"></div>
            <p style="margin-top: 16px; font-weight: 600; color: var(--text);">Memproses pembayaran...</p>
            <p style="font-size: 0.85rem; color: var(--text-light);">Mohon tunggu sebentar</p>
        `;
        document.body.appendChild(overlay);
        return;
    }
    
    container.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text">Memproses...</div>
    `;
    container.style.display = 'block';
}

export function hideLoading(containerId) {
    if (containerId === 'app') {
        const overlay = document.getElementById('globalLoading');
        if (overlay) overlay.remove();
        return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) return;
    container.style.display = 'none';
    container.innerHTML = '';
}