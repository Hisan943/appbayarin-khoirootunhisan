// ===== SPP MODULE =====

import {
    validateNIM,
    showToast,
    showLoading,
    hideLoading,
    simulateApiCall,
    formatRupiah
} from '../utils.js';
import { billData } from '../data.js';
import { processPayment } from './payment.js';

let app = null;
let currentNIM = null;
let currentSPPData = null;
let selectedItems = [];

export function initSPP(appInstance) {
    app = appInstance;
    const section = document.getElementById('section-spp');
    if (!section) return;
    
    renderSPPSection(section);
    setupSPPEvents();
}

function renderSPPSection(section) {
    section.innerHTML = `
        <div class="card">
            <div class="card-title">
                <i class="fas fa-graduation-cap"></i>
                Cicilan Biaya Kuliah / SPP
            </div>
            
            <div class="form-group">
                <label for="nimInput">NIM (12 digit)</label>
                <input type="text" id="nimInput" class="form-control" placeholder="cth: 202310001234" maxlength="12" />
                <div class="error-message" id="nimError">NIM harus 12 digit angka</div>
            </div>
            
            <button class="btn" id="cekNimBtn">
                <i class="fas fa-search"></i> Lihat Tagihan Semester
            </button>
            
            <div id="sppLoading" style="display:none;"></div>
            <div id="sppResult" style="margin-top: 16px;"></div>
        </div>
    `;
}

function setupSPPEvents() {
    const input = document.getElementById('nimInput');
    const cekBtn = document.getElementById('cekNimBtn');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cekNIM();
    });
    
    cekBtn.addEventListener('click', cekNIM);
}

function cekNIM() {
    const input = document.getElementById('nimInput');
    const nim = input.value.trim();
    const error = document.getElementById('nimError');
    
    // Validasi
    if (!validateNIM(nim)) {
        error.classList.add('show');
        input.classList.add('error');
        showToast('Format NIM tidak valid!', 'error');
        return;
    }
    error.classList.remove('show');
    input.classList.remove('error');
    
    // Cari data
    const data = billData.spp[nim];
    if (!data) {
        showToast('NIM tidak terdaftar!', 'error');
        return;
    }
    
    currentNIM = nim;
    currentSPPData = data;
    selectedItems = [];
    
    // Simulasi loading
    showLoading('sppLoading');
    document.getElementById('sppResult').innerHTML = '';
    
    simulateApiCall(data, 1000).then(result => {
        hideLoading('sppLoading');
        renderSPPResult(result);
        showToast('Data semester ditemukan!', 'success');
    });
}

function renderSPPResult(data) {
    const container = document.getElementById('sppResult');
    
    let html = `
        <div class="result-box">
            <h4 style="margin-bottom: 16px;">Daftar Cicilan Semester</h4>
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
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.desc}</td>
                <td>${formatRupiah(item.amount)}</td>
                <td><span class="badge-status ${statusClass}">${item.status}</span></td>
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
            
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <span style="color: var(--text-light);">Total terpilih:</span>
                        <span id="sppTotal" style="font-size: 1.3rem; font-weight: 700; color: var(--primary);">Rp 0</span>
                    </div>
                    <button class="btn" id="bayarSppBtn">
                        <i class="fas fa-check"></i> Bayar Terpilih
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Event listener checkbox
    document.querySelectorAll('.spp-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSPPTotal);
    });
    
    document.getElementById('bayarSppBtn').addEventListener('click', bayarSPP);
    
    // Update total awal
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
    
    const totalEl = document.getElementById('sppTotal');
    if (totalEl) {
        totalEl.textContent = formatRupiah(total);
    }
    
    selectedItems = checkboxes;
}

function bayarSPP() {
    const checkboxes = document.querySelectorAll('.spp-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showToast('Pilih minimal satu cicilan!', 'error');
        return;
    }
    
    let total = 0;
    const selected = [];
    
    checkboxes.forEach(cb => {
        const index = parseInt(cb.dataset.index);
        if (currentSPPData && currentSPPData[index]) {
            total += currentSPPData[index].amount;
            selected.push({
                ...currentSPPData[index],
                index: index
            });
        }
    });
    
    // Proses pembayaran
    processPayment(app, 'spp', {
        nim: currentNIM,
        items: selected,
        total: total,
        desc: `Pembayaran ${selected.length} cicilan SPP`
    });
}