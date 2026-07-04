// ===== UTILITY FUNCTIONS =====

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function validateNIM(nim) {
    return /^\d{12}$/.test(nim);
}

function validatePhone(phone) {
    return /^08\d{8,11}$/.test(phone);
}

function validatePelanggan(id) {
    return /^[A-Za-z0-9]{8,12}$/.test(id);
}

function generateVA() {
    return '8888' + Math.floor(100000000 + Math.random() * 900000000);
}

function generateTellerCode() {
    return 'TP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key, defaultVal = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
}

function simulateApiCall(data, delay = 1000) {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
}

function detectProvider(phone) {
    if (!phone) return null;
    const prefixes = Object.keys(providerPrefix).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
        if (phone.startsWith(prefix)) {
            return providerPrefix[prefix];
        }
    }
    return null;
}

function showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<div class="spinner"></div><div class="loading-text">Memproses...</div>`;
    el.style.display = 'block';
}

function hideLoading(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.display = 'none';
    el.innerHTML = '';
}