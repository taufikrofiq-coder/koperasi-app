// pembiayaan.js

// API Configuration
const API_BASE_URL = ''; // ✅ BENAR - gunakan relative path
const API_PEMBIAYAAN = '/api/pembiayaan'; // ✅ BENAR

// Global variables
let currentPembiayaanData = null;
let currentSimulasiData = null;

// DOM Elements
const createModal = document.getElementById('createModal');
const inquiryModal = document.getElementById('inquiryModal');
const simulasiModal = document.getElementById('simulasiModal');

// ========== UTILITY FUNCTIONS ==========
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
        return '-';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

function formatShortDate(dateString) {
    if (!dateString || dateString === '-' || dateString === 'null' || dateString === 'undefined') {
        return '-';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const result = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        return result;
    } catch (e) {
        console.error('Error formatting short date:', e, 'for:', dateString);
        return dateString;
    }
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-saldo" style="padding: 20px;">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Memuat data...</span>
            </div>
        `;
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="saldo-error" style="padding: 20px;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
    }
}

// ========== MODAL FUNCTIONS ==========
function openCreateModal() {
    createModal.style.display = 'block';
    resetCreateForm();
}

function closeCreateModal() {
    createModal.style.display = 'none';
}

function openInquiryModal() {
    inquiryModal.style.display = 'block';
    document.getElementById('searchNoPembiayaan').value = '';
    document.getElementById('inquiryResult').style.display = 'none';
    document.getElementById('inquiryError').style.display = 'none';
    document.getElementById('btnReport').style.display = 'none';
}

function closeInquiryModal() {
    inquiryModal.style.display = 'none';
}

function openSimulasiModal() {
    simulasiModal.style.display = 'block';
    resetSimulasiForm();
    
    setTimeout(() => {
        document.getElementById('simulasiAmount').focus();
    }, 100);
}

function closeSimulasiModal() {
    simulasiModal.style.display = 'none';
}

// ========== NAVIGATION FUNCTIONS ==========
function toggleNav() {
    const nav = document.getElementById('mobileNav');
    nav.classList.toggle('active');
}

function logout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        localStorage.clear();
        window.location.href = '/';
    }
}

function openNotifications() {
    alert('Fitur notifikasi akan datang!');
}

// ========== FORM FUNCTIONS ==========
function resetCreateForm() {
    document.getElementById('createForm').reset();
    document.getElementById('customerInfo').style.display = 'none';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('startDate').min = today;
}

function resetSimulasiForm() {
    document.getElementById('simulasiForm').reset();
    document.getElementById('simulasiResult').style.display = 'none';
    document.getElementById('simulasiError').style.display = 'none';
    document.getElementById('btnExportSimulasi').style.display = 'none';
    
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('simulasiStartDate');
    if (startDateInput) {
        startDateInput.value = today;
        startDateInput.min = today;
    }
}
// ========== CUSTOMER SEARCH ==========
async function searchCustomer() {
    const customerIdInput = document.getElementById('customerId');
    const customerId = customerIdInput.value.trim();

    if (!customerId) {
        alert('Masukkan No Rekening terlebih dahulu');
        return;
    }

    try {
        const searchButton = document.querySelector('.btn-secondary[onclick="searchCustomer()"]');
        const originalText = searchButton.innerHTML;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
        searchButton.disabled = true;

        console.log('🔍 Searching customer with no rekening:', customerId);
        
        // Gunakan endpoint yang tepat berdasarkan response Anda
        const endpoint = `${API_BASE_URL}/api/users/rekening/${customerId}`;
        console.log(`Using endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        console.log(`Response status:`, response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('🔍 FULL Customer search result:', JSON.stringify(result, null, 2));

        // DEBUG: Lihat struktur data
        console.log('🔍 result.responseCode:', result.responseCode);
        console.log('🔍 result.data:', result.data);
        console.log('🔍 result.data?.nama:', result.data?.nama);
        console.log('🔍 result.data?.userName:', result.data?.userName);
        console.log('🔍 result.data?.noRekening:', result.data?.noRekening);

        // Handle response dengan struktur yang sesuai
        if (result.responseCode === "200" && result.data) {
            const customer = result.data;
            
            // TAMPILKAN DEBUG DI ALERT UNTUK MELIHAT DATA
            console.log('🔍 Customer object for display:', customer);
            
            // Dapatkan nama dari berbagai kemungkinan field
            let customerName = 'N/A';
            if (customer.nama) {
                customerName = customer.nama;
            } else if (customer.userName) {
                customerName = customer.userName;
            } else if (customer.name) {
                customerName = customer.name;
            }
            
            const noRekening = customer.noRekening || customerId;
            
            // Debug: tampilkan apa yang akan ditampilkan
            console.log(`🔍 Will display - Name: "${customerName}", No Rekening: "${noRekening}"`);
            
            document.getElementById('customerName').textContent = customerName;
            document.getElementById('customerNIK').textContent = `No Rekening: ${noRekening}`;
            document.getElementById('customerInfo').style.display = 'block';

            const customerData = {
                id: customer.userId || customer.id || '',
                userId: customer.userId || customer.id || '',
                nama: customerName,
                noRekening: noRekening,
            };
            
            customerIdInput.dataset.customerData = JSON.stringify(customerData);
            customerIdInput.classList.remove('error-border');
            customerIdInput.classList.add('success-border');
            
            console.log('✅ Customer data stored:', customerData);
            
            // Tampilkan alert untuk konfirmasi (debug)
            alert(`Nasabah ditemukan!\nNama: ${customerName}\nNo Rekening: ${noRekening}`);
            
        } else {
            console.error('❌ Data tidak valid:', result);
            alert('Nasabah tidak ditemukan atau data tidak lengkap');
            customerIdInput.classList.remove('success-border');
            customerIdInput.classList.add('error-border');
        }

    } catch (error) {
        console.error('❌ Error searching customer:', error);
        
        let errorMessage = 'Terjadi kesalahan saat mengambil data nasabah';
        if (error.message.includes('404') || error.message.includes('tidak ditemukan')) {
            errorMessage = 'Nasabah tidak ditemukan. Periksa nomor rekening.';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.';
        } else {
            errorMessage = error.message;
        }
        
        alert(errorMessage);
        
        const customerIdInput = document.getElementById('customerId');
        customerIdInput.classList.remove('success-border');
        customerIdInput.classList.add('error-border');
    } finally {
        const searchButton = document.querySelector('.btn-secondary[onclick="searchCustomer()"]');
        if (searchButton) {
            searchButton.innerHTML = '<i class="fas fa-search"></i> Cari';
            searchButton.disabled = false;
        }
    }
}

// ========== CREATE PEMBIAYAAN ==========
async function submitCreatePembiayaan() {
    const form = document.getElementById('createForm');
    if (!form.checkValidity()) {
        alert('Harap lengkapi semua field yang wajib diisi');
        return;
    }

    const customerDataStr = document.getElementById('customerId').dataset.customerData;
    
    if (!customerDataStr) {
        alert('Harap cari dan pilih nasabah terlebih dahulu');
        return;
    }

    let customerData;
    try {
        customerData = JSON.parse(customerDataStr);
    } catch (e) {
        console.error('Error parsing customerData:', e);
        alert('Data nasabah tidak valid. Silakan cari ulang nasabah.');
        return;
    }

    if (!customerData.nama || !customerData.noRekening) {
        alert('Data nasabah tidak lengkap. Silakan cari ulang nasabah.');
        return;
    }

    const amount = parseFloat(document.getElementById('amount').value);
    const tenor = parseInt(document.getElementById('tenor').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const startDate = document.getElementById('startDate').value;
    const purpose = document.getElementById('purpose').value;

    if (amount <= 0 || isNaN(amount)) {
        alert('Jumlah pinjaman harus lebih dari 0');
        return;
    }

    if (tenor <= 0 || isNaN(tenor)) {
        alert('Tenor harus lebih dari 0 bulan');
        return;
    }

    if (interestRate <= 0 || isNaN(interestRate)) {
        alert('Suku bunga harus lebih dari 0%');
        return;
    }

    if (!startDate) {
        alert('Tanggal mulai harus diisi');
        return;
    }

    const requestData = {
        nama: customerData.nama,
        noRekening: customerData.noRekening,
        jangkaWaktu: tenor,
        saldoAwal: amount,
        bunga: interestRate,
        tanggalAwalPembiayaan: startDate
    };

    if (purpose && purpose.trim() !== '') {
        requestData.purpose = purpose.trim();
    }

    if (customerData.id || customerData.userId) {
        requestData.customerId = customerData.id || customerData.userId;
    }

    const confirmation = confirm(
        `Buat pembiayaan baru?\n\n` +
        `Nasabah: ${customerData.nama}\n` +
        `No Rekening: ${customerData.noRekening}\n` +
        `Jumlah: Rp ${amount.toLocaleString('id-ID')}\n` +
        `Jangka Waktu: ${tenor} bulan\n` +
        `Bunga: ${interestRate}% per tahun\n` +
        `Tanggal Mulai: ${startDate}`
    );

    if (!confirmation) {
        return;
    }

    const submitButton = document.querySelector('.modal-footer .btn-primary');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    submitButton.disabled = true;

    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Token tidak ditemukan. Silakan login ulang.');
        }

        const response = await fetch(`${API_PEMBIAYAAN}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            const textResponse = await response.text();
            if (response.status === 200 || response.status === 201) {
                alert('Pembiayaan berhasil dibuat!');
                closeCreateModal();
                loadAllPembiayaan();
                return;
            }
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        if (response.ok || response.status === 200 || response.status === 201) {
            if (result.responseCode === "200" || result.responseCode === "201" || result.success === true) {
                alert('Pembiayaan berhasil dibuat!');
                closeCreateModal();
                loadAllPembiayaan();
            } else if (result.responseCode === "500" || result.responseCode === "400") {
                throw new Error(result.responseDesc || result.message || 'Gagal membuat pembiayaan');
            } else {
                alert('Pembiayaan berhasil dibuat!');
                closeCreateModal();
                loadAllPembiayaan();
            }
        } else {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            if (result && result.responseDesc) {
                errorMessage = result.responseDesc;
            } else if (result && result.message) {
                errorMessage = result.message;
            } else if (result && result.error) {
                errorMessage = result.error;
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error creating pembiayaan:', error);
        
        let userMessage = error.message;
        if (error.message.includes('tanggalAwalPembiayaan')) {
            userMessage = 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD';
        } else if (error.message.includes('NullPointerException')) {
            userMessage = 'Data tidak lengkap. Pastikan semua field terisi dengan benar.';
        } else if (error.message.includes('500')) {
            userMessage = 'Server error. Silakan coba lagi nanti.';
        }
        
        alert(`Error: ${userMessage}`);
    } finally {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// ========== INQUIRY PEMBIAYAAN ==========
async function searchPembiayaan() {
    const noPembiayaan = document.getElementById('searchNoPembiayaan').value.trim();
    if (!noPembiayaan) {
        alert('Masukkan nomor pembiayaan terlebih dahulu');
        return;
    }

    const inquiryResult = document.getElementById('inquiryResult');
    const inquiryError = document.getElementById('inquiryError');
    const inquiryLoading = document.getElementById('inquiryLoading');
    
    if (inquiryResult) inquiryResult.style.display = 'none';
    if (inquiryError) inquiryError.style.display = 'none';
    if (inquiryLoading) {
        inquiryLoading.style.display = 'block';
        inquiryLoading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat data...';
    }

    try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        const response = await fetch(`${API_PEMBIAYAAN}/inquiry/${noPembiayaan}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (inquiryLoading) inquiryLoading.style.display = 'none';

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.responseDesc || errorData.message || errorMessage;
            } catch (e) {
                // Jika response bukan JSON
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        if (result.responseCode === "200" || result.success) {
            currentPembiayaanData = result.data;
            displayInquiryResult(result.data);
            if (inquiryError) inquiryError.style.display = 'none';
            
            const btnReport = document.getElementById('btnReport');
            if (btnReport) btnReport.style.display = 'inline-flex';
        } else {
            if (inquiryResult) inquiryResult.style.display = 'none';
            if (inquiryError) {
                inquiryError.style.display = 'flex';
                const errorSpan = inquiryError.querySelector('span');
                if (errorSpan) {
                    errorSpan.textContent = result.responseDesc || result.message || 'Data tidak ditemukan';
                }
            }
            
            const btnReport = document.getElementById('btnReport');
            if (btnReport) btnReport.style.display = 'none';
        }
    } catch (error) {
        console.error('Error searching pembiayaan:', error);
        
        if (inquiryLoading) inquiryLoading.style.display = 'none';
        
        if (inquiryResult) inquiryResult.style.display = 'none';
        if (inquiryError) {
            inquiryError.style.display = 'flex';
            const errorSpan = inquiryError.querySelector('span');
            if (errorSpan) {
                errorSpan.textContent = error.message || 'Gagal mengambil data';
            }
        }
        
        const btnReport = document.getElementById('btnReport');
        if (btnReport) btnReport.style.display = 'none';
    }
}

function displayInquiryResult(data) {
    if (!data || !data.pembiayaan) {
        document.getElementById('inquiryResult').style.display = 'none';
        const errorElement = document.getElementById('inquiryError');
        if (errorElement) {
            errorElement.style.display = 'flex';
            const errorSpan = errorElement.querySelector('span');
            if (errorSpan) errorSpan.textContent = 'Data tidak valid';
        }
        return;
    }
    
    const pembiayaan = data.pembiayaan;
    
    // Update elements
    const updateElement = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };
    
    updateElement('resultNoPembiayaan', pembiayaan.noPembiayaan || '-');
    updateElement('resultCustomerName', pembiayaan.nama || '-');
    updateElement('resultAmount', formatCurrency(parseFloat(pembiayaan.saldoAwal) || 0));
    updateElement('resultTenor', `${pembiayaan.jangkaWaktu || 0} Bulan`);
    updateElement('resultInterestRate', `${pembiayaan.bunga || pembiayaan.bagiHasil || 0}%`);
    updateElement('resultStatus', pembiayaan.status || '-');
    updateElement('resultStartDate', formatDate(pembiayaan.tanggalAwalPembiayaan) || '-');
    
    let saldoPokok = 0;
    if (data.jadwalCicilan && data.jadwalCicilan.length > 0) {
        const unpaidCicilan = data.jadwalCicilan.find(c => c.status !== 'LUNAS');
        if (unpaidCicilan && unpaidCicilan.saldoAwal) {
            saldoPokok = parseFloat(unpaidCicilan.saldoAwal);
        }
    }
    updateElement('resultSaldoPokok', formatCurrency(saldoPokok));
    
    const nextPaymentElement = document.getElementById('resultNextPayment');
    if (nextPaymentElement) {
        if (data.jadwalCicilan && data.jadwalCicilan.length > 0) {
            const nextPayment = data.jadwalCicilan.find(c => c.status === 'BELUM BAYAR');
            if (nextPayment) {
                nextPaymentElement.innerHTML = 
                    `<strong>Angsuran berikutnya:</strong><br>
                     ${formatDate(nextPayment.tanggalJatuhTempo)} - ${formatCurrency(parseFloat(nextPayment.cicilan))}`;
            } else {
                nextPaymentElement.innerHTML = 
                    '<strong>Semua angsuran telah lunas</strong>';
            }
        } else {
            nextPaymentElement.innerHTML = 
                '<em>Belum ada jadwal angsuran</em>';
        }
    }
    
    displayCicilanTable(data.jadwalCicilan);
    
    const resultElement = document.getElementById('inquiryResult');
    if (resultElement) {
        resultElement.style.display = 'block';
    }
}

function displayCicilanTable(jadwalCicilan) {
    const resultContainer = document.getElementById('inquiryResult');
    
    const oldTable = document.getElementById('cicilanTableContainer');
    if (oldTable) oldTable.remove();
    
    if (!jadwalCicilan || jadwalCicilan.length === 0) {
        return;
    }
    
    const tableContainer = document.createElement('div');
    tableContainer.id = 'cicilanTableContainer';
    tableContainer.style.marginTop = '20px';
    
    let tableHtml = `
        <h5 style="margin-bottom: 10px; color: #2c3e50;">
            <i class="fas fa-calendar-alt"></i> Jadwal Cicilan
        </h5>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 10px; min-width: 800px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                        <th style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6; white-space: nowrap;">No.</th>
                        <th style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6; white-space: nowrap;">Tanggal Jatuh Tempo</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Saldo Awal</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Pokok</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Bunga</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Total Cicilan</th>
                        <th style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6; white-space: nowrap;">Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    jadwalCicilan.forEach((item, index) => {
        const statusClass = item.status === 'LUNAS' ? 'type-deposit' : 
                           item.status === 'BELUM BAYAR' ? 'type-withdraw' : '';
        
        tableHtml += `
            <tr style="${index % 2 === 0 ? 'background-color: #fafafa;' : ''}">
                <td style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6;">
                    ${index + 1}
                </td>
                <td style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6;">
                    ${formatShortDate(item.tanggalJatuhTempo)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6;">
                    ${formatCurrency(parseFloat(item.saldoAwal) || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6;">
                    ${formatCurrency(parseFloat(item.pokok) || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6;">
                    ${formatCurrency(parseFloat(item.bunga) || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; font-weight: bold;">
                    ${formatCurrency(parseFloat(item.cicilan) || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6;">
                    <span class="type-badge ${statusClass}" style="font-size: 0.75rem; padding: 4px 8px;">
                        ${item.status || '-'}
                    </span>
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
                </tbody>
            </table>
        </div>
    `;
    
    tableContainer.innerHTML = tableHtml;
    resultContainer.appendChild(tableContainer);
}

// ========== SIMULASI PEMBIAYAAN ==========
async function calculateSimulasi() {
    const form = document.getElementById('simulasiForm');
    if (!form.checkValidity()) {
        alert('Harap lengkapi semua field yang wajib diisi');
        return;
    }

    const requestData = {
        saldoAwal: parseFloat(document.getElementById('simulasiAmount').value),
        jangkaWaktu: parseInt(document.getElementById('simulasiTenor').value),
        bungaTahunan: parseFloat(document.getElementById('simulasiInterestRate').value),
        tanggalMulai: document.getElementById('simulasiStartDate').value
    };

    if (requestData.saldoAwal < 100000) {
        showSimulasiError('Saldo awal minimum Rp 100.000');
        return;
    }
    
    if (requestData.bungaTahunan < 0 || requestData.bungaTahunan > 100) {
        showSimulasiError('Bunga tahunan harus antara 0% - 100%');
        return;
    }

    document.getElementById('simulasiResult').style.display = 'none';
    document.getElementById('simulasiError').style.display = 'none';
    document.getElementById('simulasiTable').innerHTML = `
        <div class="loading-saldo" style="padding: 20px;">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Menghitung simulasi...</span>
        </div>
    `;

    try {
        const response = await fetch(`${API_PEMBIAYAAN}/simulasi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                const errorText = await response.text();
                if (errorText) errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        if (result.responseCode === "200" || result.success) {
            currentSimulasiData = result.data || result;
            displaySimulasiResult(currentSimulasiData);
            document.getElementById('btnExportSimulasi').style.display = 'inline-flex';
        } else {
            throw new Error(result.responseDesc || result.message || 'Gagal menghitung simulasi');
        }
    } catch (error) {
        console.error('Error calculating simulasi:', error);
        showSimulasiError(`Error: ${error.message}`);
    }
}

function displaySimulasiResult(data) {
    document.getElementById('simulasiError').style.display = 'none';
    
    document.getElementById('simCicilanBulan').textContent = 
        formatCurrency(data.cicilanBulanan || data.cicilanPerBulan || data.monthlyPayment || 0);
    
    document.getElementById('simTotalBayar').textContent = 
        formatCurrency(data.totalPembayaran || data.totalPayment || 0);
    
    document.getElementById('simTotalBunga').textContent = 
        formatCurrency(data.totalBunga || data.totalInterest || 0);
    
    document.getElementById('simJenis').textContent = 
        data.jenisAngsuran || data.type || 'ANUITAS';
    
    if (data.jadwal && data.jadwal.length > 0) {
        const tableHtml = generateAmortizationTable(data.jadwal);
        document.getElementById('simulasiTable').innerHTML = tableHtml;
        document.getElementById('simulasiTableContainer').style.display = 'block';
    } else if (data.jadwalAngsuran && data.jadwalAngsuran.length > 0) {
        const tableHtml = generateAmortizationTable(data.jadwalAngsuran);
        document.getElementById('simulasiTable').innerHTML = tableHtml;
        document.getElementById('simulasiTableContainer').style.display = 'block';
    } else if (data.schedule && data.schedule.length > 0) {
        const tableHtml = generateAmortizationTable(data.schedule);
        document.getElementById('simulasiTable').innerHTML = tableHtml;
        document.getElementById('simulasiTableContainer').style.display = 'block';
    } else {
        document.getElementById('simulasiTableContainer').style.display = 'none';
    }
    
    document.getElementById('simulasiResult').style.display = 'block';
}

function generateAmortizationTable(schedule) {
    let tableHtml = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 10px; min-width: 600px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                        <th style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6; white-space: nowrap;">Bulan Ke</th>
                        <th style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6; white-space: nowrap;">Tanggal Jatuh Tempo</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Saldo Awal</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Pokok</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Bunga</th>
                        <th style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; white-space: nowrap;">Total Cicilan</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    schedule.forEach((item, index) => {
        const isLastRow = index === schedule.length - 1;
        const rowStyle = isLastRow ? 'background-color: #f0f9ff;' : '';
        
        tableHtml += `
            <tr style="${rowStyle}">
                <td style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6; ${isLastRow ? 'font-weight: bold;' : ''}">
                    ${item.bulanKe || item.periode || item.period || index + 1}
                </td>
                <td style="padding: 10px 12px; text-align: center; border: 1px solid #dee2e6;">
                    ${formatShortDate(item.tanggalJatuhTempo || item.dueDate || '-')}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6;">
                    ${formatCurrency(item.saldoAwal || item.sisaPokok || item.remainingBalance || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6;">
                    ${formatCurrency(item.pokok || item.principal || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6;">
                    ${formatCurrency(item.bunga || item.interest || 0)}
                </td>
                <td style="padding: 10px 12px; text-align: right; border: 1px solid #dee2e6; font-weight: bold; ${isLastRow ? 'color: #2ecc71;' : ''}">
                    ${formatCurrency(item.cicilan || item.total || item.payment || 0)}
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 15px; font-size: 0.8rem; color: #6c757d; text-align: center;">
            <i class="fas fa-info-circle"></i> Menampilkan ${schedule.length} bulan dari total angsuran
        </div>
    `;
    
    return tableHtml;
}

function showSimulasiError(message) {
    document.getElementById('simulasiErrorMessage').textContent = message;
    document.getElementById('simulasiError').style.display = 'flex';
    document.getElementById('simulasiResult').style.display = 'none';
    document.getElementById('btnExportSimulasi').style.display = 'none';
}

// ========== LOAD ALL PEMBIAYAAN ==========
async function loadAllPembiayaan() {
    console.log('=== LOADING PEMBIAYAAN ===');
    showLoading('pembiayaanTable');
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Token:', token ? 'Available' : 'Not available');
        
        const response = await fetch(`${API_PEMBIAYAAN}/ViewAll`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.responseCode === "200") {
            console.log('Data received:', result.data ? result.data.length : 0, 'items');
            
            if (!result.data) {
                throw new Error('Data tidak ditemukan di response');
            }
            
            displayPembiayaanTable(result.data);
            updateStats(result.data);
        } else {
            throw new Error(result.responseDesc || 'Gagal memuat data pembiayaan');
        }
        
    } catch (error) {
        console.error('Error loading pembiayaan:', error);
        showError('pembiayaanTable', error.message || 'Gagal memuat data pembiayaan');
    }
}
// ========== PAGING VARIABLES ==========
let allPembiayaanData = [];
let currentPage = 1;
const rowsPerPage = 10;

// ========== DISPLAY PEMBIAYAAN TABLE WITH PAGING ==========
function displayPembiayaanTable(data) {
    console.log('Displaying table with', data.length, 'items');
    
    // Simpan semua data untuk paging
    allPembiayaanData = data;
    
    if (!data || data.length === 0) {
        document.getElementById('pembiayaanTable').innerHTML = `
            <div class="saldo-error" style="padding: 20px;">
                <i class="fas fa-info-circle"></i>
                <span>Tidak ada data pembiayaan</span>
            </div>
        `;
        return;
    }
    
    // Hitung total halaman
    const totalPages = Math.ceil(data.length / rowsPerPage);
    
    // Ambil data untuk halaman saat ini
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, data.length);
    const pageData = data.slice(startIndex, endIndex);
    
    let tableHtml = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 800px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                        <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #dee2e6; white-space: nowrap;">No.</th>
                        <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #dee2e6; white-space: nowrap;">No. Pembiayaan</th>
                        <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #dee2e6; white-space: nowrap;">Nasabah</th>
                        <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #dee2e6; white-space: nowrap;">No. Rekening</th>
                        <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #dee2e6; white-space: nowrap;">Jangka Waktu</th>
                        <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #dee2e6; white-space: nowrap;">Status</th>
                        <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #dee2e6; white-space: nowrap;">Tanggal Mulai</th>
                        <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #dee2e6; white-space: nowrap;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Hitung nomor urut berdasarkan halaman
    const startNumber = (currentPage - 1) * rowsPerPage + 1;
    
    pageData.forEach((item, index) => {
        const statusClass = item.status === 'LUNAS' ? 'type-deposit' : 
                           item.status === 'AKTIF' ? 'type-withdraw' : '';
        
        const noPembiayaan = item.noPembiayaan || item.id;
        
        tableHtml += `
            <tr style="border-bottom: 1px solid #e9ecef; ${index % 2 === 0 ? 'background-color: #fafafa;' : ''}">
                <td style="padding: 12px 10px; text-align: center; font-weight: 500; color: #6c757d;">
                    ${startNumber + index}
                </td>
                <td style="padding: 12px 10px; font-weight: 600; color: #2c3e50; white-space: nowrap;">
                    ${noPembiayaan || '-'}
                </td>
                <td style="padding: 12px 10px; white-space: nowrap;">
                    ${item.nama || '-'}
                </td>
                <td style="padding: 12px 10px; color: #6c757d; white-space: nowrap;">
                    ${item.noRekening || '-'}
                </td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">
                    ${item.jangkaWaktu || '0'} Bulan
                </td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">
                    <span class="type-badge ${statusClass}" style="font-size: 0.75rem; padding: 4px 8px;">
                        ${item.status || '-'}
                    </span>
                </td>
                <td style="padding: 12px 10px; text-align: center; color: #495057; white-space: nowrap;">
                    ${formatShortDate(item.tanggalAwalPembiayaan) || '-'}
                </td>
                <td style="padding: 12px 10px; text-align: center; white-space: nowrap;">
                    <button onclick="viewDetail('${noPembiayaan}')" 
                            style="background: #3498db; color: white; border: none; cursor: pointer; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 5px; transition: all 0.3s;"
                            title="Lihat Detail"
                            onmouseover="this.style.background='#2980b9'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='#3498db'; this.style.transform='translateY(0)'">
                        <i class="fas fa-eye" style="font-size: 0.8rem;"></i> Detail
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
                </tbody>
            </table>
        </div>
    `;
    
    // Tambahkan informasi paging dan kontrol
    tableHtml += `
        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; font-size: 0.8rem; color: #6c757d;">
            <div style="display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-info-circle"></i>
                <span>Menampilkan <strong>${startIndex + 1}-${endIndex}</strong> dari <strong>${data.length}</strong> data</span>
                ${data.length > rowsPerPage ? `<span>(Halaman ${currentPage} dari ${totalPages})</span>` : ''}
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
                ${data.length > rowsPerPage ? `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button onclick="goToPage(1)" 
                                style="background: ${currentPage === 1 ? '#bdc3c7' : '#3498db'}; color: white; border: none; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;"
                                ${currentPage === 1 ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button onclick="prevPage()" 
                                style="background: ${currentPage === 1 ? '#bdc3c7' : '#3498db'}; color: white; border: none; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;"
                                ${currentPage === 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i> Sebelumnya
                        </button>
                        
                        <span style="padding: 0 5px;">Halaman ${currentPage} dari ${totalPages}</span>
                        
                        <button onclick="nextPage()" 
                                style="background: ${currentPage === totalPages ? '#bdc3c7' : '#3498db'}; color: white; border: none; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;"
                                ${currentPage === totalPages ? 'disabled' : ''}>
                            Selanjutnya <i class="fas fa-chevron-right"></i>
                        </button>
                        <button onclick="goToPage(${totalPages})" 
                                style="background: ${currentPage === totalPages ? '#bdc3c7' : '#3498db'}; color: white; border: none; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;"
                                ${currentPage === totalPages ? 'disabled' : ''}>
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                ` : ''}
                
                <div style="display: flex; align-items: center; gap: 5px;">
                    <button onclick="refreshPembiayaan()" 
                            style="background: none; border: 1px solid #3498db; color: #3498db; cursor: pointer; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; display: flex; align-items: center; gap: 5px;"
                            title="Refresh data">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('pembiayaanTable').innerHTML = tableHtml;
    console.log('Table rendered successfully with paging');
}

// ========== PAGING FUNCTIONS ==========
function goToPage(page) {
    if (page >= 1 && page <= Math.ceil(allPembiayaanData.length / rowsPerPage)) {
        currentPage = page;
        displayPembiayaanTable(allPembiayaanData);
        scrollToTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(allPembiayaanData.length / rowsPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function scrollToTable() {
    const tableSection = document.querySelector('.system-info-card');
    if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========== MODIFIED LOAD ALL PEMBIAYAAN ==========
async function loadAllPembiayaan() {
    console.log('=== LOADING PEMBIAYAAN ===');
    showLoading('pembiayaanTable');
    currentPage = 1; // Reset ke halaman 1 setiap kali reload
    
    try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Token:', token ? 'Available' : 'Not available');
        
        const response = await fetch(`${API_PEMBIAYAAN}/ViewAll`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.responseCode === "200") {
            console.log('Data received:', result.data ? result.data.length : 0, 'items');
            
            if (!result.data) {
                throw new Error('Data tidak ditemukan di response');
            }
            
            displayPembiayaanTable(result.data);
            updateStats(result.data);
        } else {
            throw new Error(result.responseDesc || 'Gagal memuat data pembiayaan');
        }
        
    } catch (error) {
        console.error('Error loading pembiayaan:', error);
        showError('pembiayaanTable', error.message || 'Gagal memuat data pembiayaan');
    }
}

// ========== MODIFIED REFRESH FUNCTION ==========
function refreshPembiayaan() {
    currentPage = 1; // Reset ke halaman 1 saat refresh
    loadAllPembiayaan();
}
// ========== UPDATE STATS ==========
function updateStats(data) {
    const totalAktif = data.filter(item => item.status === 'AKTIF').length;
    const totalLunas = data.filter(item => item.status === 'LUNAS').length;
    
    document.getElementById('totalAktif').textContent = totalAktif;
    document.getElementById('totalLunas').textContent = totalLunas;
    
    const totalMenungguElement = document.getElementById('totalMenunggu');
    if (totalMenungguElement) {
        const totalMenunggu = data.filter(item => item.status === 'MENUNGGU' || item.status === 'PENDING').length;
        totalMenungguElement.textContent = totalMenunggu;
    }
}

// ========== VIEW DETAIL ==========
function viewDetail(noPembiayaan) {
    if (!noPembiayaan) {
        alert('Nomor pembiayaan tidak valid');
        return;
    }
    
    document.getElementById('searchNoPembiayaan').value = noPembiayaan;
    openInquiryModal();
    
    setTimeout(() => {
        document.getElementById('searchNoPembiayaan').focus();
        searchPembiayaan();
    }, 300);
}

// ========== REFRESH ==========
function refreshPembiayaan() {
    loadAllPembiayaan();
}

// ========== INITIAL LOAD ==========
// Load data saat halaman siap
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing pembiayaan page');
    
    // Set current date
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const now = new Date();
        currentDateElement.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Load data after a short delay
    setTimeout(() => {
        console.log('Loading pembiayaan data...');
        loadAllPembiayaan();
    }, 500);
});

// ========== DEBUG FUNCTIONS ==========
// Untuk debugging langsung di console browser
window.debugLoadPembiayaan = async function() {
    try {
        const token = localStorage.getItem('token');
        console.log('Debug - Token:', token);
        
        const response = await fetch('/pembiayaan/ViewAll', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Debug - Response status:', response.status);
        const result = await response.json();
        console.log('Debug - Response data:', result);
        
        return result;
    } catch (error) {
        console.error('Debug error:', error);
    }
};

// Debug customer data
window.debugCustomerData = function() {
    const customerDataStr = document.getElementById('customerId').dataset.customerData;
    console.log('Debug - customerData:', customerDataStr);
    if (customerDataStr) {
        console.log('Debug - Parsed customerData:', JSON.parse(customerDataStr));
    }
    alert('Check console for customer data');
};

async function generateReport() {
    if (!currentPembiayaanData) {
        alert('Tidak ada data pembiayaan untuk dicetak');
        return;
    }
    
    try {
        // Tampilkan loading
        const originalText = document.getElementById('btnReport').innerHTML;
        document.getElementById('btnReport').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat PDF...';
        document.getElementById('btnReport').disabled = true;
        
        // Generate PDF
        await generatePembiayaanPDF(currentPembiayaanData);
        
        // Reset button
        document.getElementById('btnReport').innerHTML = originalText;
        document.getElementById('btnReport').disabled = false;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Gagal membuat laporan PDF: ' + error.message);
        
        // Reset button
        const btnReport = document.getElementById('btnReport');
        if (btnReport) {
            btnReport.innerHTML = '<i class="fas fa-print"></i> Cetak Laporan';
            btnReport.disabled = false;
        }
    }
}

// Ganti bagian fungsi generatePembiayaanPDF() yang ada dengan ini:

async function generatePembiayaanPDF(data) {
    return new Promise((resolve, reject) => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pembiayaan = data.pembiayaan;
            const jadwalCicilan = data.jadwalCicilan || [];
            
            // Hitung total pokok dari jadwal cicilan (gunakan nama variabel berbeda)
            const totalPinjaman = jadwalCicilan.reduce(
                (sum, item) => sum + (parseFloat(item.pokok) || 0),
                0
            );

            /* ================= TITLE ================= */
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(44, 62, 80);
            doc.text("LAPORAN PEMBIAYAAN", 105, 20, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`No. Pembiayaan: ${pembiayaan.noPembiayaan || "-"}`, 105, 30, { align: "center" });
            doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 105, 35, { align: "center" });

            doc.setDrawColor(52, 152, 219);
            doc.setLineWidth(0.5);
            doc.line(15, 40, 195, 40);

            let yPosition = 50;

            /* ================= DATA PEMBIAYAAN ================= */
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(52, 152, 219);
            doc.text("DATA PEMBIAYAAN", 15, yPosition);

            yPosition += 10;
            doc.setFontSize(10);
            doc.setTextColor(0);

            const pembiayaanData = [
                ["No. Pembiayaan", pembiayaan.noPembiayaan || "-"],
                ["Nasabah", pembiayaan.nama || "-"],
                ["No. Rekening", pembiayaan.noRekening || "-"],
                ['Jumlah Pinjaman', formatCurrencyPDF(totalPinjaman)],
                ["Jangka Waktu", `${pembiayaan.jangkaWaktu || 0} Bulan`],
                ["Suku Bunga", `${pembiayaan.bunga || pembiayaan.bagiHasil || 0}% per tahun`],
                ["Status", pembiayaan.status || "-"],
                ["Tanggal Mulai", formatDatePDF(pembiayaan.tanggalAwalPembiayaan)],
                ["Tanggal Akhir", formatDatePDF(pembiayaan.tanggalAkhirPembiayaan)],
                ["Tanggal Dibuat", formatDatePDF(pembiayaan.tanggal)]
            ];

            pembiayaanData.forEach(row => {
                doc.setFont("helvetica", "bold");
                doc.text(row[0], 15, yPosition);
                doc.setFont("helvetica", "normal");
                doc.text(row[1], 80, yPosition);
                yPosition += 7;
            });

            yPosition += 5;

            /* ================= RINGKASAN ================= */
            if (jadwalCicilan.length) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.setTextColor(52, 152, 219);
                doc.text("RINGKASAN ANGSURAN", 15, yPosition);

                yPosition += 10;
                doc.setFontSize(10);
                doc.setTextColor(0);

                // Gunakan nama variabel berbeda untuk menghitung summary
                const summaryTotalPokok = jadwalCicilan.reduce((s, i) => s + (+i.pokok || 0), 0);
                const totalBunga = jadwalCicilan.reduce((s, i) => s + (+i.bunga || 0), 0);
                const totalCicilan = jadwalCicilan.reduce((s, i) => s + (+i.cicilan || 0), 0);

                [
                    ["Total Angsuran", formatCurrencyPDF(totalCicilan)],
                    ["Total Pokok", formatCurrencyPDF(summaryTotalPokok)],
                    ["Total Bunga", formatCurrencyPDF(totalBunga)],
                    ["Jumlah Cicilan", `${jadwalCicilan.length} kali`]
                ].forEach(r => {
                    doc.setFont("helvetica", "bold");
                    doc.text(r[0], 15, yPosition);
                    doc.setFont("helvetica", "normal");
                    doc.text(r[1], 80, yPosition);
                    yPosition += 7;
                });

                yPosition += 10;
            }

            /* ================= JADWAL ANGSURAN ================= */
            if (yPosition > 240) { doc.addPage(); yPosition = 20; }

            const headers = ["No", "Jatuh Tempo", "Saldo Awal", "Pokok", "Bunga", "Total", "Status"];
            const colWidths = [8, 28, 32, 30, 28, 32, 20];
            const tableX = 15;
            const tableWidth = colWidths.reduce((a, b) => a + b, 0);

            const drawHeader = () => {
                doc.setFillColor(52, 152, 219);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(255);
                doc.rect(tableX, yPosition, tableWidth, 8, "F");

                let headerX = tableX;
                headers.forEach((h, i) => {
                    doc.text(h, headerX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                    headerX += colWidths[i];
                });

                yPosition += 8;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(0);
            };

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(52, 152, 219);
            doc.text("JADWAL ANGSURAN DETAIL", tableX, yPosition);
            yPosition += 10;

            drawHeader();

            jadwalCicilan.forEach((item, idx) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                    drawHeader();
                }

                const row = [
                    idx + 1,
                    formatShortDatePDF(item.tanggalJatuhTempo),
                    formatCurrencyPDF(+item.saldoAwal || 0),
                    formatCurrencyPDF(+item.pokok || 0),
                    formatCurrencyPDF(+item.bunga || 0),
                    formatCurrencyPDF(+item.cicilan || 0),
                    item.status || "-"
                ];

                let rowX = tableX;
                row.forEach((c, i) => {
                    if (i === 6) {
                        doc.setFontSize(9);
                        doc.text(c, rowX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                        doc.setFontSize(10);
                    } else if (i === 0) {
                        doc.text(String(c), rowX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                    } else if (i >= 2 && i <= 5) {
                        doc.text(c, rowX + colWidths[i] - 3, yPosition + 5, { align: "right" });
                    } else {
                        doc.text(c, rowX + 2, yPosition + 5);
                    }
                    rowX += colWidths[i];
                });

                doc.setDrawColor(220);
                doc.line(tableX, yPosition + 8, tableX + tableWidth, yPosition + 8);
                yPosition += 8;
            });

            /* ================= FOOTER ================= */
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Halaman ${i} dari ${pageCount}`, 105, 287, { align: "center" });
                doc.text("Danaku App - Manajemen Pembiayaan", 105, 292, { align: "center" });
            }

            doc.save(`Laporan-Pembiayaan-${pembiayaan.noPembiayaan || "unknown"}.pdf`);
            resolve();

        } catch (err) {
            console.error('Error generating PDF:', err);
            reject(err);
        }
    });
}

// Helper functions for PDF
function formatCurrencyPDF(amount) {
    if (isNaN(amount) || amount === 0) return 'Rp 0';
    return 'Rp ' + amount.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatDatePDF(dateString) {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function formatShortDatePDF(dateString) {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Ganti fungsi exportSimulasi() yang ada dengan ini:

async function exportSimulasi() {
    if (!currentSimulasiData) {
        alert('Tidak ada data simulasi untuk diexport');
        return;
    }
    
    try {
        // Tampilkan loading
        const btnExport = document.getElementById('btnExportSimulasi');
        const originalText = btnExport.innerHTML;
        btnExport.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membuat PDF...';
        btnExport.disabled = true;
        
        // Generate PDF
        await generateSimulasiPDF(currentSimulasiData);
        
        // Reset button
        btnExport.innerHTML = originalText;
        btnExport.disabled = false;
        
    } catch (error) {
        console.error('Error generating simulasi PDF:', error);
        alert('Gagal membuat PDF simulasi: ' + error.message);
        
        // Reset button
        const btnExport = document.getElementById('btnExportSimulasi');
        if (btnExport) {
            btnExport.innerHTML = '<i class="fas fa-download"></i> Export';
            btnExport.disabled = false;
        }
    }
}

// Fungsi untuk generate PDF simulasi
async function generateSimulasiPDF(simulasiData) {
    return new Promise((resolve, reject) => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // Data dari form
            const saldoAwal = parseFloat(document.getElementById('simulasiAmount').value) || 0;
            const jangkaWaktu = parseInt(document.getElementById('simulasiTenor').value) || 0;
            const bungaTahunan = parseFloat(document.getElementById('simulasiInterestRate').value) || 0;
            const tanggalMulai = document.getElementById('simulasiStartDate').value || '';
            
            // Data hasil simulasi
            const cicilanBulanan = simulasiData.cicilanBulanan || simulasiData.cicilanPerBulan || 0;
            const totalPembayaran = simulasiData.totalPembayaran || simulasiData.totalPayment || 0;
            const totalBunga = simulasiData.totalBunga || simulasiData.totalInterest || 0;
            const jenisAngsuran = simulasiData.jenisAngsuran || simulasiData.type || 'ANUITAS';
            
            // Jadwal angsuran
            const jadwal = simulasiData.jadwal || simulasiData.jadwalAngsuran || simulasiData.schedule || [];

            /* ================= TITLE ================= */
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.setTextColor(44, 62, 80);
            doc.text("LAPORAN SIMULASI PEMBIAYAAN", 105, 20, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Simulasi Pembiayaan - ${new Date().toLocaleDateString("id-ID")}`, 105, 30, { align: "center" });

            doc.setDrawColor(46, 204, 113);
            doc.setLineWidth(0.5);
            doc.line(15, 35, 195, 35);

            let yPosition = 45;

            /* ================= PARAMETER SIMULASI ================= */
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(46, 204, 113);
            doc.text("PARAMETER SIMULASI", 15, yPosition);

            yPosition += 10;
            doc.setFontSize(10);
            doc.setTextColor(0);

            const parameterData = [
                ["Saldo Awal (Pinjaman)", formatCurrencyPDF(saldoAwal)],
                ["Jangka Waktu", `${jangkaWaktu} Bulan`],
                ["Suku Bunga Tahunan", `${bungaTahunan}%`],
                ["Tanggal Mulai", formatDatePDF(tanggalMulai)],
                ["Jenis Angsuran", jenisAngsuran.toUpperCase()],
                ["Metode Perhitungan", "Sistem Bunga Efektif (Anuitas)"]
            ];

            parameterData.forEach(row => {
                doc.setFont("helvetica", "bold");
                doc.text(row[0], 15, yPosition);
                doc.setFont("helvetica", "normal");
                doc.text(row[1], 70, yPosition);
                yPosition += 7;
            });

            yPosition += 5;

            /* ================= HASIL SIMULASI ================= */
            if (yPosition > 200) { doc.addPage(); yPosition = 20; }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(46, 204, 113);
            doc.text("HASIL SIMULASI", 15, yPosition);

            yPosition += 10;
            doc.setFontSize(11);
            
            // Box hasil simulasi
            doc.setFillColor(240, 250, 242);
            doc.roundedRect(15, yPosition, 180, 25, 3, 3, 'F');
            
            doc.setFont("helvetica", "bold");
            doc.setTextColor(44, 62, 80);
            
            // Cicilan per bulan
            doc.text("Cicilan per Bulan:", 20, yPosition + 10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(39, 174, 96);
            doc.text(formatCurrencyPDF(cicilanBulanan), 140, yPosition + 10, { align: "right" });
            
            // Total pembayaran
            doc.setFont("helvetica", "bold");
            doc.setTextColor(44, 62, 80);
            doc.text("Total Pembayaran:", 20, yPosition + 20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(39, 174, 96);
            doc.text(formatCurrencyPDF(totalPembayaran), 140, yPosition + 20, { align: "right" });
            
            yPosition += 35;

            // Informasi detail
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            
            const detailData = [
                ["Total Pinjaman", formatCurrencyPDF(saldoAwal)],
                ["Total Bunga", formatCurrencyPDF(totalBunga)],
                ["Rasio Bunga", `${((totalBunga / totalPembayaran) * 100).toFixed(2)}% dari total pembayaran`]
            ];

            detailData.forEach(row => {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(44, 62, 80);
                doc.text(row[0], 15, yPosition);
                doc.setFont("helvetica", "normal");
                doc.text(row[1], 70, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            /* ================= JADWAL ANGSURAN ================= */
            if (jadwal.length > 0) {
                if (yPosition > 220) { doc.addPage(); yPosition = 20; }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.setTextColor(46, 204, 113);
                doc.text("JADWAL ANGSURAN DETAIL", 15, yPosition);

                yPosition += 10;

                // Header table
                const headers = ["Bulan", "Tanggal", "Saldo Awal", "Pokok", "Bunga", "Angsuran"];
                const colWidths = [15, 30, 35, 35, 35, 40];
                const tableX = 15;
                const tableWidth = colWidths.reduce((a, b) => a + b, 0);

                // Draw header
                doc.setFillColor(46, 204, 113);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(255);
                doc.rect(tableX, yPosition, tableWidth, 8, "F");

                let headerX = tableX;
                headers.forEach((h, i) => {
                    doc.text(h, headerX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                    headerX += colWidths[i];
                });

                yPosition += 8;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(0);

                // Draw rows
                jadwal.forEach((item, index) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                        
                        // Draw header again on new page
                        doc.setFillColor(46, 204, 113);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(10);
                        doc.setTextColor(255);
                        doc.rect(tableX, yPosition, tableWidth, 8, "F");
                        
                        headerX = tableX;
                        headers.forEach((h, i) => {
                            doc.text(h, headerX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                            headerX += colWidths[i];
                        });
                        
                        yPosition += 8;
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(9);
                        doc.setTextColor(0);
                    }

                    const row = [
                        item.bulanKe || item.periode || index + 1,
                        formatShortDatePDF(item.tanggalJatuhTempo || item.dueDate),
                        formatCurrencyPDF(item.saldoAwal || item.sisaPokok || item.remainingBalance || 0),
                        formatCurrencyPDF(item.pokok || item.principal || 0),
                        formatCurrencyPDF(item.bunga || item.interest || 0),
                        formatCurrencyPDF(item.cicilan || item.total || item.payment || 0)
                    ];

                    let cellX = tableX;
                    row.forEach((cell, i) => {
                        if (i === 0) {
                            doc.text(String(cell), cellX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                        } else if (i >= 2) {
                            doc.text(cell, cellX + colWidths[i] - 2, yPosition + 5, { align: "right" });
                        } else {
                            doc.text(cell, cellX + 2, yPosition + 5);
                        }
                        cellX += colWidths[i];
                    });

                    // Add light gray line
                    doc.setDrawColor(240, 240, 240);
                    doc.line(tableX, yPosition + 8, tableX + tableWidth, yPosition + 8);
                    yPosition += 8;
                });

                // Summary row
                yPosition += 5;
                doc.setDrawColor(46, 204, 113);
                doc.setLineWidth(0.3);
                doc.line(tableX, yPosition, tableX + tableWidth, yPosition);
                
                yPosition += 2;
                doc.setFont("helvetica", "bold");
                doc.setTextColor(44, 62, 80);
                
                // Total row
                const totals = ["TOTAL", "", 
                    formatCurrencyPDF(saldoAwal),
                    formatCurrencyPDF(jadwal.reduce((sum, item) => sum + (parseFloat(item.pokok) || 0), 0)),
                    formatCurrencyPDF(jadwal.reduce((sum, item) => sum + (parseFloat(item.bunga) || 0), 0)),
                    formatCurrencyPDF(totalPembayaran)
                ];

                let totalX = tableX;
                totals.forEach((cell, i) => {
                    if (i === 0) {
                        doc.text(cell, totalX + colWidths[i] / 2, yPosition + 5, { align: "center" });
                    } else if (i >= 2) {
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(39, 174, 96);
                        doc.text(cell, totalX + colWidths[i] - 2, yPosition + 5, { align: "right" });
                        doc.setTextColor(44, 62, 80);
                    }
                    totalX += colWidths[i];
                });
            }

            /* ================= CATATAN ================= */
            yPosition += 15;
            
            if (yPosition > 250) { doc.addPage(); yPosition = 20; }
            
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100);
            
            const notes = [
                "Catatan:",
                "1. Simulasi ini berdasarkan parameter yang dimasukkan",
                "2. Angka-angka dapat berubah sesuai kebijakan lembaga",
                "3. Jadwal angsuran dapat disesuaikan sesuai kesepakatan",
                "4. Simulasi ini tidak mengikat dan bersifat informatif"
            ];
            
            notes.forEach((note, index) => {
                doc.text(note, 15, yPosition);
                yPosition += 5;
            });

            /* ================= FOOTER ================= */
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Halaman ${i} dari ${pageCount}`, 105, 287, { align: "center" });
                doc.text("Simulasi Pembiayaan - Danaku App", 105, 292, { align: "center" });
                doc.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`, 105, 297, { align: "center" });
            }

            // Save PDF
            const fileName = `Simulasi-Pembiayaan-${new Date().getTime()}.pdf`;
            doc.save(fileName);
            
            resolve();
            
        } catch (err) {
            console.error('Error generating simulasi PDF:', err);
            reject(err);
        }
    });
}

// Fungsi untuk format mata uang di PDF
function formatCurrencyPDF(amount) {
    if (isNaN(amount) || amount === 0) return 'Rp 0';
    return 'Rp ' + amount.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Fungsi untuk format tanggal lengkap di PDF
function formatDatePDF(dateString) {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Fungsi untuk format tanggal singkat di PDF
function formatShortDatePDF(dateString) {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Fungsi untuk export JSON (opsional, jika masih dibutuhkan)
function exportSimulasiJSON() {
    if (!currentSimulasiData) {
        alert('Tidak ada data simulasi untuk diexport');
        return;
    }
    
    // Create export data
    const exportData = {
        ...currentSimulasiData,
        exportDate: new Date().toISOString(),
        requestData: {
            saldoAwal: parseFloat(document.getElementById('simulasiAmount').value) || 0,
            jangkaWaktu: parseInt(document.getElementById('simulasiTenor').value) || 0,
            bungaTahunan: parseFloat(document.getElementById('simulasiInterestRate').value) || 0,
            tanggalMulai: document.getElementById('simulasiStartDate').value
        }
    };
    
    // Convert to JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    // Create download link
    const exportFileDefaultName = `simulasi-pembiayaan-${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}


function refreshPembiayaan() {
    loadAllPembiayaan();
}

// Helper function untuk format tanggal
function formatDate(dateString) {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
        return '-';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
    
}

