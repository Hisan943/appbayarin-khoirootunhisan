// ===== PULSA MODULE =====

import {
    validatePhone,
    detectProvider,
    showToast,
    formatRupiah
} from '../utils.js';
import { processPayment } from './payment.js';

let app = null;
let selectedProvider = null;
let selectedNominal = 0;

export function initPulsa(appInstance) {
    app = appInstance;
    const section = document.getElementById('section-pulsa');
    if (!section) return;
    
    renderPulsaSection(section);
    setupPulsaEvents();
}

function renderPulsaSection(section) {
    section.innerHTML = `
        <div class="card">
            <div class="card-title">
                <i class="fas fa-sim-card"></i>
                Isi Pulsa & Paket Data
            </div>
            
            <div class="form-group">
                <label>Pilih Provider</label>
                <div class="grid-3col" id="providerGrid">
                    <div class="provider-card" data-provider="Telkomsel">
                        <i class="fas fa-circle" style="color: #e21e2e;"></i>
                        <span>Telkomsel</span>
                    </div>
                    <div class="provider-card" data-provider="XL">
                        <i class="fas fa-circle" style="color: #0066b3;"></i>
                        <span>XL</span>
                    </div>
                    <div class="provider-card" data-provider="Indosat">
                        <i class="fas fa-circle" style="color: #e31e2e;"></i>
                        <span>Indosat</span>
                    </div>
                    <div class="provider-card" data-provider="Tri">
                        <i class="fas fa-circle" style="color: #5b2b8a;"></i>
                        <span>Tri</span>
                    </div>
                    <div class="provider-card" data-provider="Smartfren">
                        <i class="fas fa-circle" style="color: #ed1c24;"></i>
                        <span>Smartfren</span>
                    </div>
                    <div class="provider-card" data-provider="Axis">
                        <i class="fas fa-circle" style="color: #f47721;"></i>
                        <span>Axis</span>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="hpInput">Nomor HP</label>
                <input id="hpInput" class="form-control" placeholder="cth: 08123456789" maxlength="13" />
                <div class="error-message" id="hpError">Nomor HP harus 10-13 digit dan dimulai dengan 08</div>
            </div>
            
            <div class="form-group">
                <label>Nominal Pulsa</label>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0;" id="nominalGroup">
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="10000">Rp 10k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="25000">Rp 25k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="50000">Rp 50k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="100000">Rp 100k</button>
                    <button class="btn btn-outline btn-sm nominal-btn" data-nominal="200000">Rp 200k</button>
                </div>
                <input id="nominalInput" class="form-control" placeholder="atau masukkan nominal lainnya (cth: 150000)" />
                <div class="error-message" id="nominalError">Masukkan nominal yang valid (minimal Rp 1.000)</div>
            </div>
            
            <button class="btn btn-block" id="cekPulsaBtn">
                <i class="fas fa-arrow-right"></i> Preview & Bayar
            </button>
            
            <div id="pulsaPreview" style="margin-top: 16px;"></div>
        </div>
    `;
}

function setupPulsaEvents() {
    // Provider selection
    document.querySelectorAll('.provider-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedProvider = card.dataset.provider;
            showToast(`Provider: ${selectedProvider}`, 'info');
        });
    });
    
    // Nominal buttons
    document.querySelectorAll('.nominal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedNominal = parseInt(btn.dataset.nominal);
            document.getElementById('nominalInput').value = selectedNominal;
        });
    });
    
    // Nominal input
    document.getElementById('nominalInput').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) {
            selectedNominal = val;
            document.querySelectorAll('.nominal-btn').forEach(b => b.classList.remove('active'));
        }
    });
    
    // Phone input validation
    document.getElementById('hpInput').addEventListener('input', (e) => {
        const phone = e.target.value;
        const error = document.getElementById('hpError');
        if (phone && !validatePhone(phone)) {
            error.classList.add('show');
            e.target.classList.add('error');
        } else {
            error.classList.remove('show');
            e.target.classList.remove('error');
        }
    });
    
    // Preview & bayar
    document.getElementById('cekPulsaBtn').addEventListener('click', previewPulsa);
    
    // Enter key
    document.getElementById('hpInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') previewPulsa();
    });
    document.getElementById('nominalInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') previewPulsa();
    });
}

function previewPulsa() {
    const phone = document.getElementById('hpInput').value.trim();
    const hpError = document.getElementById('hpError');
    const nominalError = document.getElementById('nominalError');
    
    // Validasi HP
    if (!validatePhone(phone)) {
        hpError.classList.add('show');
        document.getElementById('hpInput').classList.add('error');
        showToast('Nomor HP tidak valid!', 'error');
        return;
    }
    hpError.classList.remove('show');
    document.getElementById('hpInput').classList.remove('error');
    
    // Validasi nominal
    if (!selectedNominal || selectedNominal < 1000) {
        nominalError.classList.add('show');
        showToast('Masukkan nominal yang valid!', 'error');
        return;
    }
    nominalError.classList.remove('show');
    
    // Detect provider
    const detectedProvider = detectProvider(phone);
    if (!detectedProvider) {
        showToast('Provider tidak terdeteksi, silakan pilih manual', 'warning');
        return;
    }
    
    // Jika provider belum dipilih, gunakan hasil deteksi
    if (!selectedProvider) {
        selectedProvider = detectedProvider;
        document.querySelectorAll('.provider-card').forEach(c => {
            if (c.dataset.provider === selectedProvider) {
                c.classList.add('active');
            }
        });
    }
    
    // Preview
    const preview = document.getElementById('pulsaPreview');
    preview.innerHTML = `
        <div class="result-box">
            <h4 style="margin-bottom: 12px;">Preview Pembayaran</h4>
            <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-light);">
                    <span>Provider</span>
                    <span><strong>${selectedProvider}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-light);">
                    <span>Nomor Tujuan</span>
                    <span><strong>${phone}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-light);">
                    <span>Nominal</span>
                    <span><strong>${formatRupiah(selectedNominal)}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 1.1rem; font-weight: 700; color: var(--primary);">
                    <span>Total</span>
                    <span>${formatRupiah(selectedNominal)}</span>
                </div>
            </div>
            <button class="btn btn-block" id="bayarPulsaBtn" style="margin-top: 16px;">
                <i class="fas fa-check"></i> Konfirmasi Pembayaran
            </button>
        </div>
    `;
    
    document.getElementById('bayarPulsaBtn').addEventListener('click', () => {
        bayarPulsa(phone, selectedProvider, selectedNominal);
    });
}

function bayarPulsa(phone, provider, nominal) {
    processPayment(app, 'pulsa', {
        phone: phone,
        provider: provider,
        total: nominal,
        desc: `Isi Pulsa ${provider} - ${phone}`
    });
}