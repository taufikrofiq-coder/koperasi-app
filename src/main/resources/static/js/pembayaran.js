// pembayaran.js - Pembiayaan Payment System (Fixed with complete flow)
// const API_BASE_URL = 'http://localhost:2121';
const API_BASE_URL = '';
const API_ENDPOINTS = {
    inquiryPembiayaan: '/api/pembiayaan/inquiry',
    inquiryAngsuran: '/api/pembiayaan/inquiry/angsuran',
    paymentAngsuran: '/api/pembayaran/angsuran'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pembayaran system loading...');
    
    // Authentication token
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!authToken) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = '/';
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    // Element references
    const searchForm = document.getElementById('searchPembiayaanForm');
    const noPembiayaanInput = document.getElementById('noPembiayaan');
    const searchBtn = document.getElementById('searchPembiayaan');
    const pembiayaanResult = document.getElementById('pembiayaanResult');
    const pembiayaanDetail = document.getElementById('pembiayaanDetail');
    const angsuranTable = document.getElementById('angsuranTable');
    const pembayaranModal = document.getElementById('pembayaranModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelPayment = document.getElementById('cancelPayment');
    const submitPayment = document.getElementById('submitPayment');
    const paymentDetails = document.getElementById('paymentDetails');
    const totalBayar = document.getElementById('totalBayar');
    const paymentTypeSelect = document.getElementById('paymentType');

    // State variables
    let currentPembiayaan = null;
    let currentAngsuran = null;
    let allAngsuran = [];
    let isProcessing = false; // Flag untuk mencegah double click

    // Initialize
    initializePaymentSystem();

    // Event Listeners
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchPembiayaan();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', searchPembiayaan);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closePaymentModal);
    }

    if (cancelPayment) {
        cancelPayment.addEventListener('click', function() {
            closePaymentModal();
            resetPaymentForm();
        });
    }

    if (submitPayment) {
        submitPayment.addEventListener('click', processPayment);
    }

    if (paymentTypeSelect) {
        paymentTypeSelect.addEventListener('change', updatePaymentDetails);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === pembayaranModal) {
            closePaymentModal();
            resetPaymentForm();
        }
    });

    // Functions
    function initializePaymentSystem() {
        console.log('Payment system initialized');
        
        // Set current date
        const currentDate = new Date();
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = currentDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    async function searchPembiayaan() {
        const noPembiayaan = noPembiayaanInput ? noPembiayaanInput.value.trim() : '';
        
        if (!noPembiayaan) {
            showToast('error', 'Masukkan nomor pembiayaan');
            return;
        }

        showLoading(pembiayaanResult, 'Mencari data pembiayaan...');
        clearResults();
        
        try {
            // Get pembiayaan details
            const pembiayaanResponse = await fetch(
                `${API_BASE_URL}${API_ENDPOINTS.inquiryPembiayaan}/${noPembiayaan}`,
                { 
                    headers: headers,
                    method: 'GET'
                }
            );
            
            if (!pembiayaanResponse.ok) {
                throw new Error('Gagal mengambil data pembiayaan');
            }
            
            const pembiayaanData = await pembiayaanResponse.json();
            
            if (pembiayaanData.responseCode !== '200') {
                throw new Error(pembiayaanData.responseDesc || 'Data tidak ditemukan');
            }
            
            currentPembiayaan = pembiayaanData.data.pembiayaan;
            allAngsuran = pembiayaanData.data.jadwalCicilan || [];
            
            // Display pembiayaan details
            displayPembiayaanDetail(currentPembiayaan);
            
            // Display all angsuran
            displayAllAngsuran(allAngsuran);
            
            // Show success
            showSuccess(pembiayaanResult, 'Data pembiayaan ditemukan');
            
        } catch (error) {
            console.error('Error in searchPembiayaan:', error);
            showError(pembiayaanResult, error.message || 'Gagal mengambil data');
            clearResults();
        }
    }

    function displayPembiayaanDetail(pembiayaan) {
        if (!pembiayaanDetail) return;
        
        try {
            pembiayaanDetail.innerHTML = `
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-file-invoice-dollar me-2"></i>Detail Pembiayaan</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <table class="table table-sm">
                                    <tr>
                                        <th width="40%">No Pembiayaan</th>
                                        <td><strong>${escapeHtml(pembiayaan.noPembiayaan)}</strong></td>
                                    </tr>
                                    <tr>
                                        <th>Nama Anggota</th>
                                        <td>${escapeHtml(pembiayaan.nama)}</td>
                                    </tr>
                                    <tr>
                                        <th>No Rekening</th>
                                        <td>${escapeHtml(pembiayaan.noRekening)}</td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <table class="table table-sm">
                                    <tr>
                                        <th width="40%">Jangka Waktu</th>
                                        <td>${escapeHtml(pembiayaan.jangkaWaktu)} Bulan</td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal Mulai</th>
                                        <td>${formatDate(pembiayaan.tanggalAwalPembiayaan)}</td>
                                    </tr>
                                    <tr>
                                        <th>Tanggal Akhir</th>
                                        <td>${formatDate(pembiayaan.tanggalAkhirPembiayaan)}</td>
                                    </tr>
                                      <tr>
                                        <th>Status</th>
                                        <td>${escapeHtml(pembiayaan.status)}</td>
                                    </tr>
                                  
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            pembiayaanDetail.style.display = 'block';
        } catch (error) {
            console.error('Error in displayPembiayaanDetail:', error);
            pembiayaanDetail.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>Error menampilkan detail pembiayaan
                </div>
            `;
            pembiayaanDetail.style.display = 'block';
        }
    }

    function displayAllAngsuran(angsuranList) {
        if (!angsuranTable) return;
        
        if (!angsuranList || angsuranList.length === 0) {
            angsuranTable.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>Tidak ada data angsuran
                </div>
            `;
            return;
        }
        
        try {
            let tableHTML = `
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead class="table-dark">
                            <tr>
                                <th>No</th>
                                <th>Tanggal Jatuh Tempo</th>
                                <th>Saldo Awal</th>
                                <th>Cicilan</th>
                                <th>Bunga</th>
                                <th>Pokok</th>
                                <th></th>
                                <th>Tanggal Bayar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            angsuranList.forEach(angsuran => {
                tableHTML += `
                    <tr>
                        <td>${escapeHtml(angsuran.no)}</td>
                        <td>${formatDate(angsuran.tanggalJatuhTempo)}</td>
                        <td>Rp ${formatCurrency(angsuran.saldoAwal)}</td>
                        <td>Rp ${formatCurrency(angsuran.cicilan)}</td>
                        <td>Rp ${formatCurrency(angsuran.bunga)}</td>
                        <td>Rp ${formatCurrency(angsuran.pokok)}</td>
                        <td><span class="badge ${getStatusBadge(angsuran.status)}">${escapeHtml(angsuran.status)}</span></td>
                        <td>${angsuran.tanggalBayar ? formatDate(angsuran.tanggalBayar) : '-'}</td>
                        <td>
                            ${angsuran.status === 'BELUM BAYAR' ? 
                                `<button class="btn btn-sm btn-primary btn-bayar" 
                                    data-id="${angsuran.id}" 
                                    data-no="${escapeHtml(angsuran.no)}"
                                    data-amount="${angsuran.cicilan}">
                                    <i class="fas fa-money-bill-wave"></i> Bayar
                                </button>` : 
                                '<span class="text-success"><i class="fas fa-check-circle"></i> Lunas</span>'
                            }
                        </td>
                    </tr>
                `;
            });
            
            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;
            
            angsuranTable.innerHTML = tableHTML;
            
            // Add event listeners to all bayar buttons in table
            document.querySelectorAll('.btn-bayar').forEach(btn => {
                btn.addEventListener('click', handleBayarClick);
            });
            
        } catch (error) {
            console.error('Error in displayAllAngsuran:', error);
            angsuranTable.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>Error menampilkan data angsuran
                </div>
            `;
        }
    }

    function handleBayarClick(e) {
        if (isProcessing) return; // Prevent multiple clicks
        
        const button = e.currentTarget;
        const angsuranId = button.getAttribute('data-id');
        const angsuranNo = button.getAttribute('data-no');
        const amount = button.getAttribute('data-amount');
        
        // Find the angsuran details
        const angsuran = allAngsuran.find(a => a.id == angsuranId);
        
        if (!angsuran) {
            showToast('error', 'Data angsuran tidak ditemukan');
            return;
        }
        
        // Set current angsuran
        currentAngsuran = angsuran;
        
        // Show payment modal
        showPaymentModal(angsuran);
    }

    function showPaymentModal(angsuran) {
        if (!pembayaranModal) {
            showToast('error', 'Modal pembayaran tidak ditemukan');
            return;
        }
        
        // Reset processing flag
        isProcessing = false;
        
        // Update modal title
        const modalTitle = document.querySelector('#pembayaranModal .modal-title');
        if (modalTitle) {
            modalTitle.innerHTML = `<i class="fas fa-money-bill-wave me-2"></i>Bayar ${escapeHtml(angsuran.no)}`;
        }
        
        // Update payment details
        if (paymentDetails) {
            paymentDetails.innerHTML = `
                <div class="alert alert-info">
                    <h6><i class="fas fa-info-circle me-2"></i>Detail Angsuran</h6>
                    <table class="table table-sm mb-0">
                        <tr>
                            <td><strong>No Angsuran:</strong></td>
                            <td>${escapeHtml(angsuran.no)}</td>
                        </tr>
                        <tr>
                            <td><strong>Nasabah:</strong></td>
                            <td>${escapeHtml(angsuran.nama)}</td>
                        </tr>
                        <tr>
                            <td><strong>No Rekening:</strong></td>
                            <td>${escapeHtml(angsuran.noRekening)}</td>
                        </tr>
                        <tr>
                            <td><strong>Jatuh Tempo:</strong></td>
                            <td>${formatDate(angsuran.tanggalJatuhTempo)}</td>
                        </tr>
                        <tr>
                            <td><strong>Cicilan:</strong></td>
                            <td><strong class="text-primary">Rp ${formatCurrency(angsuran.cicilan)}</strong></td>
                        </tr>
                    </table>
                </div>
            `;
        }
        
        // Set total amount
        if (totalBayar) {
            const amount = parseFloat(angsuran.cicilan) || 0;
            totalBayar.value = amount;
            totalBayar.setAttribute('data-base-amount', amount);
        }
        
        // Reset payment type
        if (paymentTypeSelect) {
            paymentTypeSelect.value = '';
        }
        
        // Reset submit button
        if (submitPayment) {
            submitPayment.innerHTML = '<i class="fas fa-check me-2"></i>Bayar';
            submitPayment.disabled = false;
        }
        
        // Show modal
        pembayaranModal.style.display = 'block';
        
        // Focus on payment type select
        setTimeout(() => {
            if (paymentTypeSelect) paymentTypeSelect.focus();
        }, 300);
    }

    function updatePaymentDetails() {
        if (!paymentTypeSelect || !totalBayar) return;
        
        const paymentType = paymentTypeSelect.value;
        const baseAmountStr = totalBayar.getAttribute('data-base-amount');
        
        if (!baseAmountStr) return;
        
        const baseAmount = parseFloat(baseAmountStr);
        
        if (isNaN(baseAmount)) return;
        
        let additionalFee = 0;
        
        switch(paymentType) {
            case 'tunai':
                additionalFee = 0;
                break;
            case 'transfer':
                additionalFee = 2500;
                break;
            case 'qris':
                additionalFee = 1500;
                break;
            case 'debit':
                additionalFee = 1000;
                break;
        }
        
        const totalAmount = baseAmount + additionalFee;
        totalBayar.value = totalAmount.toFixed(2);
    }

    async function processPayment() {
        // Prevent double click
        if (isProcessing) return;
        
        if (!currentAngsuran) {
            showToast('error', 'Data angsuran tidak valid');
            return;
        }
        
        if (!paymentTypeSelect || !totalBayar) {
            showToast('error', 'Form pembayaran tidak lengkap');
            return;
        }
        
        const paymentType = paymentTypeSelect.value;
        const amount = totalBayar.value;
        
        if (!paymentType) {
            showToast('error', 'Pilih metode pembayaran');
            return;
        }
        
        // Validate amount
        const baseAmount = parseFloat(currentAngsuran.cicilan) || 0;
        const enteredAmount = parseFloat(amount) || 0;
        
        if (enteredAmount < baseAmount) {
            showToast('error', `Jumlah pembayaran kurang dari cicilan (minimal Rp ${formatCurrency(baseAmount)})`);
            return;
        }
        
        // Set processing flag
        isProcessing = true;
        
        // Disable submit button
        if (submitPayment) {
            submitPayment.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Memproses...';
            submitPayment.disabled = true;
        }
        
        try {
            // Prepare payment data
            const paymentData = {
                amount: enteredAmount,
                paymentType: paymentType,
                paymentDate: new Date().toISOString().split('T')[0],
                notes: `Pembayaran ${currentAngsuran.no} via ${paymentType}`
            };
            
            console.log('Processing payment:', paymentData);
            
            // Send PUT request
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.paymentAngsuran}/${currentAngsuran.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(paymentData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.responseDesc || `Gagal memproses pembayaran (Status: ${response.status})`;
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            console.log('Payment result:', result);
            
            if (result.responseCode !== '200') {
                throw new Error(result.responseDesc || 'Gagal memproses pembayaran');
            }
            
            // SUCCESS - Tampilkan pesan sukses dengan alert yang jelas
            showToast('success', `✅ Pembayaran ${currentAngsuran.no} BERHASIL!`);
            
            // Tutup modal dengan delay kecil
            setTimeout(() => {
                closePaymentModal();
                resetPaymentForm();
                
                // Refresh data setelah modal tertutup
                setTimeout(() => {
                    searchPembiayaan(); // Refresh data
                }, 500);
                
            }, 1500);
            
        } catch (error) {
            console.error('Payment error:', error);
            showToast('error', error.message || 'Gagal memproses pembayaran');
            
            // Reset processing flag on error
            isProcessing = false;
            
            // Re-enable submit button
            if (submitPayment) {
                submitPayment.innerHTML = '<i class="fas fa-check me-2"></i>Bayar';
                submitPayment.disabled = false;
            }
        }
    }

    function closePaymentModal() {
        if (pembayaranModal) {
            pembayaranModal.style.display = 'none';
        }
        isProcessing = false; // Reset flag
    }

    function resetPaymentForm() {
        if (paymentTypeSelect) paymentTypeSelect.value = '';
        if (totalBayar) {
            totalBayar.value = '';
            totalBayar.removeAttribute('data-base-amount');
        }
        currentAngsuran = null;
        
        if (paymentDetails) {
            paymentDetails.innerHTML = '';
        }
        
        // Reset submit button
        if (submitPayment) {
            submitPayment.innerHTML = '<i class="fas fa-check me-2"></i>Bayar';
            submitPayment.disabled = false;
        }
    }

    function clearResults() {
        if (pembiayaanDetail) {
            pembiayaanDetail.style.display = 'none';
            pembiayaanDetail.innerHTML = '';
        }
        
        if (angsuranTable) {
            angsuranTable.innerHTML = '';
        }
    }

    // Utility functions
    function formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('id-ID');
        } catch (error) {
            return dateString;
        }
    }

    function formatCurrency(amount) {
        try {
            const num = parseFloat(amount);
            if (isNaN(num)) return '0';
            return num.toLocaleString('id-ID');
        } catch (error) {
            return '0';
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getStatusBadge(status) {
        if (!status) return 'bg-secondary';
        switch(status.toUpperCase()) {
            case 'LUNAS': return 'bg-success';
            case 'BELUM BAYAR': return 'bg-danger';
            case 'LEWAT JATUH TEMPO': return 'bg-warning text-dark';
            default: return 'bg-secondary';
        }
    }

    function showLoading(element, message = 'Memuat...') {
        if (!element) return;
        element.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">${message}</p>
            </div>
        `;
        element.style.display = 'block';
    }

    function showSuccess(element, message) {
        if (!element) {
            showToast('success', message);
            return;
        }
        element.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    function showError(element, message) {
        if (!element) {
            showToast('error', message);
            return;
        }
        element.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    function showToast(type, message) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.custom-toast');
        existingToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `custom-toast alert alert-${type} alert-dismissible fade show position-fixed`;
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        toast.style.minWidth = '350px';
        toast.style.maxWidth = '500px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const title = type === 'success' ? 'Berhasil!' : 'Error!';
        
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${icon} fa-2x me-3 ${type === 'success' ? 'text-success' : 'text-danger'}"></i>
                <div>
                    <h6 class="mb-1">${title}</h6>
                    <p class="mb-0">${message}</p>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds for success, 10 seconds for error
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, type === 'success' ? 5000 : 10000);
    }

    // Export functions for HTML
    window.closePaymentModal = closePaymentModal;
    window.processPayment = processPayment;
    
    console.log('Pembayaran system ready');
});