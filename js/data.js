// ===== DATA DUMMY =====

const billData = {
    pln: {
        "232322123456": { name: "Khoirootun Hisan", address: "Jl. Cibadak Bogor", period: "Jan-2026", amount: 245000, penalty: 0, due: "2026-02-10" },
        "223456789013": { name: "Ani Wijaya", address: "Jl. Diponegoro 45, Bandung", period: "Jan-2026", amount: 512000, penalty: 15000, due: "2026-02-15" },
        "323456789014": { name: "Cahya Putri", address: "Jl. Sudirman 78, Surabaya", period: "Jan-2026", amount: 189000, penalty: 0, due: "2026-02-12" },
        "423456789015": { name: "Deni Saputra", address: "Jl. Gatot Subroto 12, Medan", period: "Feb-2026", amount: 325000, penalty: 0, due: "2026-03-05" },
        "523456789016": { name: "Eka Fitriani", address: "Jl. Padjajaran 7, Bandung", period: "Feb-2026", amount: 276000, penalty: 8000, due: "2026-03-08" }
    },
    pdam: {
        "987654321012": { name: "Dedi Kurniawan", address: "Jl. Cipto 23, Semarang", period: "Jan-2026", amount: 87000, penalty: 0, due: "2026-02-20" },
        "987654321013": { name: "Eka Lestari", address: "Jl. Siliwangi 9, Medan", period: "Jan-2026", amount: 124000, penalty: 5000, due: "2026-02-18" },
        "987654321014": { name: "Fajar Nugroho", address: "Jl. Merpati 15, Yogyakarta", period: "Feb-2026", amount: 95000, penalty: 0, due: "2026-03-01" }
    },
    internet: {
        "112233445566": { name: "Fajar Nugroho", address: "Jl. Pahlawan 12, Yogyakarta", period: "Feb-2026", amount: 285000, penalty: 0, due: "2026-03-01" },
        "112233445577": { name: "Gita Sari", address: "Jl. Kartini 8, Makassar", period: "Feb-2026", amount: 325000, penalty: 0, due: "2026-02-28" },
        "112233445588": { name: "Hendra Wijaya", address: "Jl. Diponegoro 22, Surabaya", period: "Mar-2026", amount: 299000, penalty: 0, due: "2026-03-15" }
    },
    seminar: {
        "SEM2025A": { name: "Khoirootun Hisan", address: "Online - Zoom", period: "Seminar AI 2025", amount: 150000, penalty: 0, due: "2026-01-30" },
        "SEM2025B": { name: "Indah Permatasari", address: "Gedung Serbaguna", period: "Workshop UI/UX", amount: 200000, penalty: 0, due: "2026-02-05" },
        "SEM2025C": { name: "Joko Widodo", address: "Hotel Grand", period: "Conference Tech", amount: 350000, penalty: 0, due: "2026-02-28" }
    },
    spp: {
        "221011450381": [
            { id: 1, desc: "SPP Ganjil 2025/2026 - Cicilan 1", amount: 2500000, status: "unpaid" },
            { id: 2, desc: "SPP Ganjil 2025/2026 - Cicilan 2", amount: 2500000, status: "unpaid" },
            { id: 3, desc: "SPP Ganjil 2025/2026 - Cicilan 3", amount: 2500000, status: "unpaid" },
            { id: 4, desc: "SPP Ganjil 2025/2026 - Cicilan 4", amount: 2500000, status: "unpaid" },
            { id: 5, desc: "SPP Ganjil 2025/2026 - Cicilan 5", amount: 2500000, status: "unpaid" },
            { id: 6, desc: "SPP Ganjil 2025/2026 - Cicilan 6", amount: 2500000, status: "unpaid" }
        ],
        "202310005678": [
            { id: 1, desc: "SPP Genap 2025/2026 - Cicilan 1", amount: 2750000, status: "paid" },
            { id: 2, desc: "SPP Genap 2025/2026 - Cicilan 2", amount: 2750000, status: "unpaid" },
            { id: 3, desc: "SPP Genap 2025/2026 - Cicilan 3", amount: 2750000, status: "unpaid" },
            { id: 4, desc: "SPP Genap 2025/2026 - Cicilan 4", amount: 2750000, status: "unpaid" }
        ],
        "202310009999": [
            { id: 1, desc: "SPP Ganjil 2025/2026 - Cicilan 1", amount: 3000000, status: "paid" },
            { id: 2, desc: "SPP Ganjil 2025/2026 - Cicilan 2", amount: 3000000, status: "paid" },
            { id: 3, desc: "SPP Ganjil 2025/2026 - Cicilan 3", amount: 3000000, status: "unpaid" },
            { id: 4, desc: "SPP Ganjil 2025/2026 - Cicilan 4", amount: 3000000, status: "unpaid" },
            { id: 5, desc: "SPP Ganjil 2025/2026 - Cicilan 5", amount: 3000000, status: "unpaid" },
            { id: 6, desc: "SPP Ganjil 2025/2026 - Cicilan 6", amount: 3000000, status: "unpaid" },
            { id: 7, desc: "SPP Ganjil 2025/2026 - Cicilan 7", amount: 3000000, status: "unpaid" },
            { id: 8, desc: "SPP Ganjil 2025/2026 - Cicilan 8", amount: 3000000, status: "unpaid" }
        ]
    }
};

const providerPrefix = {
    "081": "Telkomsel", "082": "Telkomsel", "083": "Telkomsel",
    "085": "Indosat", "086": "Indosat",
    "087": "XL", "088": "XL",
    "089": "Tri"
};