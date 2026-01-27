// historyTransaksi.js


const API_BASE_URL = ''; // ✅ BENAR - gunakan relative path

document.addEventListener('DOMContentLoaded', function() {
    console.log('History Transaksi JS Loaded');
    
    // ==================== DEKLARASI FUNGSI DULU ====================
    
    // Fungsi untuk format Rupiah
    function formatRupiah(number) {
        if (!number && number !== 0) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }
    
    // Fungsi untuk menampilkan alert
    function showAlert(message, type) {
        let alertDiv = document.querySelector('.alert-message');
        
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
        
        alertDiv = document.createElement('div');
        alertDiv.className = 'alert-message';
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '15px 20px';
        alertDiv.style.borderRadius = '8px';
        alertDiv.style.color = 'white';
        alertDiv.style.fontWeight = '500';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        alertDiv.style.animation = 'slideInRight 0.3s ease-out';
        document.body.appendChild(alertDiv);
        
        const colors = {
            'error': '#e74c3c',
            'success': '#2ecc71',
            'info': '#3498db',
            'warning': '#f39c12'
        };
        
        alertDiv.style.backgroundColor = colors[type] || colors.info;
        alertDiv.innerHTML = message;
        
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (alertDiv && alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 300);
            }
        }, 3000);
        
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Fungsi untuk show loading
    function showLoading() {
        const transactionsList = document.getElementById('transactionsList');
        if (transactionsList) {
            transactionsList.innerHTML = `
                <div class="loading-transactions">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat data transaksi...</p>
                </div>
            `;
        }
    }
    
    // Fungsi untuk show error
    function showError(message) {
        const transactionsList = document.getElementById('transactionsList');
        if (transactionsList) {
            transactionsList.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Terjadi Kesalahan</h3>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;
        }
    }
    
    // Fungsi untuk fetch no rekening dari API
    async function fetchUserNoRekening(username) {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken || !username) return null;
            
            const response = await fetch(`/api/users/username/${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.responseCode === "200" && data.data) {
                    return data.data.noRekening || null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching user detail:', error);
            return null;
        }
    }
    
    // Fungsi untuk update rekening info
    function updateRekeningInfo(noRekening, nama) {
        const rekeningInfo = document.getElementById('rekeningInfo');
        
        if (rekeningInfo) {
            rekeningInfo.innerHTML = `
                <div class="rekening-item">
                    <span class="rekening-label">Nomor Rekening</span>
                    <span class="rekening-value">${noRekening}</span>
                </div>
                <div class="rekening-item">
                    <span class="rekening-label">Nama Nasabah</span>
                    <span class="rekening-value">${nama || 'Tidak tersedia'}</span>
                </div>
                <div class="rekening-item">
                    <span class="rekening-label">Total Transaksi</span>
                    <span class="rekening-value">${allTransactions.length}</span>
                </div>
            `;
        }
    }
    
    // Fungsi untuk update summary
    function updateSummary(transactions) {
        const summaryGrid = document.getElementById('summaryGrid');
        
        if (!summaryGrid) return;
        
        // Calculate totals
        let totalDebit = 0;
        let totalCredit = 0;
        let todayCount = 0;
        let todayDebit = 0;
        let todayCredit = 0;
        
        const today = new Date().toDateString();
        
        transactions.forEach(transaction => {
            // PERBAIKAN: Parse dengan benar
            const debetAmount = parseFloat(transaction.debet) || 0;
            const creditAmount = parseFloat(transaction.credit) || 0;
            
            if (debetAmount > 0) {
                totalDebit += debetAmount;
            }
            
            if (creditAmount > 0) {
                totalCredit += creditAmount;
            }
            
            const transactionDate = new Date(transaction.tanggal).toDateString();
            
            if (transactionDate === today) {
                todayCount++;
                if (debetAmount > 0) {
                    todayDebit += debetAmount;
                }
                if (creditAmount > 0) {
                    todayCredit += creditAmount;
                }
            }
        });
        
        const netBalance = totalCredit - totalDebit;
        
        summaryGrid.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Total Setoran</div>
                <div class="summary-value">${formatRupiah(totalCredit)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Penarikan</div>
                <div class="summary-value">${formatRupiah(totalDebit)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Saldo Bersih</div>
                <div class="summary-value">${formatRupiah(netBalance)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Transaksi Hari Ini</div>
                <div class="summary-value">${todayCount}</div>
            </div>
        `;
    }
    
    // Fungsi untuk filter transaksi
    function filterTransactions() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        
        console.log('Filtering with:', searchTerm, 'current filter:', currentFilter);
        
        // Filter berdasarkan search term
        let filtered = allTransactions.filter(transaction => {
            const matchesSearch = !searchTerm || 
                (transaction.keterangan && transaction.keterangan.toLowerCase().includes(searchTerm)) ||
                (transaction.nama && transaction.nama.toLowerCase().includes(searchTerm));
            
            if (!matchesSearch) return false;
            
            // Filter berdasarkan jenis transaksi - PERBAIKAN LOGIKA
            const debetAmount = parseFloat(transaction.debet) || 0;
            const creditAmount = parseFloat(transaction.credit) || 0;
            const isDebit = debetAmount > 0;
            const isCredit = creditAmount > 0;
            
            console.log(`Transaction ${transaction.id}: debit=${debetAmount}, credit=${creditAmount}, isDebit=${isDebit}, isCredit=${isCredit}`);
            
            switch (currentFilter) {
                case 'debit':
                    return isDebit;
                case 'credit':
                    return isCredit;
                case 'today':
                    const today = new Date().toDateString();
                    const transactionDate = new Date(transaction.tanggal).toDateString();
                    return transactionDate === today;
                case 'week':
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(transaction.tanggal) >= weekAgo;
                case 'month':
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return new Date(transaction.tanggal) >= monthAgo;
                default:
                    return true;
            }
        });
        
        filteredTransactions = filtered;
        console.log('Filtered results:', filteredTransactions.length);
        displayTransactions();
    }
    
    // Fungsi untuk display transaksi dengan pagination
    function displayTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        
        if (!transactionsList) {
            console.error('transactionsList element not found');
            return;
        }
        
        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-file-invoice"></i>
                    <h3>Tidak ada transaksi</h3>
                    <p>Tidak ditemukan transaksi yang sesuai dengan filter</p>
                </div>
            `;
            const paginationEl = document.getElementById('pagination');
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
        
        // Render transactions
        let transactionsHTML = '';
        
        pageTransactions.forEach(transaction => {
            // PERBAIKAN: Parsing yang benar
            const debetAmount = parseFloat(transaction.debet) || 0;
            const creditAmount = parseFloat(transaction.credit) || 0;
            const isDebit = debetAmount > 0;
            const isCredit = creditAmount > 0;
            const amount = isDebit ? debetAmount : creditAmount;
            const type = isDebit ? 'Penarikan' : 'Setoran';
            const typeClass = isDebit ? 'debit' : 'credit';
            const typeBadgeClass = isDebit ? 'type-debit' : 'type-credit';
            const amountClass = isDebit ? 'amount-debit' : 'amount-credit';
            
            // Format tanggal
            const date = new Date(transaction.tanggal);
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            transactionsHTML += `
                <div class="transaction-item ${typeClass}">
                    <div class="transaction-header">
                        <span class="transaction-type ${typeBadgeClass}">${type}</span>
                        <span class="transaction-date">${formattedDate} ${formattedTime}</span>
                    </div>
                    
                    <div class="transaction-details">
                        <div class="detail-row">
                            <span class="detail-label">ID Transaksi</span>
                            <span class="detail-value">#${transaction.id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Keterangan</span>
                            <span class="detail-value">${transaction.keterangan || '-'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Nama</span>
                            <span class="detail-value">${transaction.nama || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="transaction-amount ${amountClass}">
                        ${isDebit ? '-' : '+'} ${formatRupiah(amount)}
                    </div>
                </div>
            `;
        });
        
        transactionsList.innerHTML = transactionsHTML;
        
        // Render pagination
        renderPagination(totalPages);
    }
    
    // Fungsi untuk render pagination
    function renderPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-button" id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += `
                    <button class="page-button ${i === currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += `<span>...</span>`;
            }
        }
        
        // Next button
        paginationHTML += `
            <button class="page-button" id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Add event listeners
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayTransactions();
            }
        });
        
        document.getElementById('nextPage')?.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayTransactions();
            }
        });
        
        document.querySelectorAll('.page-button[data-page]').forEach(button => {
            button.addEventListener('click', function() {
                currentPage = parseInt(this.getAttribute('data-page'));
                displayTransactions();
            });
        });
    }
    
    // Fungsi untuk export ke Excel
    function exportToExcel() {
        if (filteredTransactions.length === 0) {
            showAlert('Tidak ada data untuk diexport', 'warning');
            return;
        }
        
        // Create CSV content
        let csvContent = "ID,No Rekening,Nama,Jenis,Jumlah,Keterangan,Tanggal\n";
        
        filteredTransactions.forEach(transaction => {
            const debetAmount = parseFloat(transaction.debet) || 0;
            const creditAmount = parseFloat(transaction.credit) || 0;
            const isDebit = debetAmount > 0;
            const type = isDebit ? 'Penarikan' : 'Setoran';
            const amount = isDebit ? debetAmount : creditAmount;
            
            csvContent += `${transaction.id},${transaction.noRekening},"${transaction.nama}",${type},${amount},"${transaction.keterangan}",${transaction.tanggal}\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `transaksi_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('Data berhasil diexport ke CSV', 'success');
    }
    
    // ==================== KODE UTAMA ====================
    
    // Ambil data user dari localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const authToken = localStorage.getItem('authToken');
    
    // Cek apakah user sudah login
    if (!userData || !authToken) {
        showAlert('Anda harus login terlebih dahulu', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        return;
    }
    
    // Variabel global
    let allTransactions = [];
    let filteredTransactions = [];
    let currentFilter = 'all';
    let currentPage = 1;
    const itemsPerPage = 10;
    
    // Setup event listeners
    function setupEventListeners() {
        // Tombol kembali
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', function() {
                window.history.back();
            });
        }
        
        // Tombol export
        const exportButton = document.getElementById('exportButton');
        if (exportButton) {
            exportButton.addEventListener('click', exportToExcel);
        }
        
        // Tombol search
        const searchButton = document.getElementById('searchButton');
        const searchInput = document.getElementById('searchInput');
        
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                filterTransactions();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    filterTransactions();
                }
            });
        }
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Set current filter
                currentFilter = this.getAttribute('data-filter');
                currentPage = 1;
                
                // Filter transactions
                filterTransactions();
            });
        });
    }
    
    // Fungsi untuk load transaksi
    async function loadTransactions() {
        try {
            // Ambil no rekening dari userData
            const userData = JSON.parse(localStorage.getItem('userData'));
            let noRekening = userData?.noRekening;
            
            // Jika tidak ada no rekening, coba ambil dari API
            if (!noRekening) {
                noRekening = await fetchUserNoRekening(userData.userName);
                if (noRekening) {
                    userData.noRekening = noRekening;
                    localStorage.setItem('userData', JSON.stringify(userData));
                } else {
                    throw new Error('Nomor rekening tidak ditemukan');
                }
            }
            
            console.log('Loading transactions for noRekening:', noRekening);
            
            // Tampilkan loading
            showLoading();
            
            // Fetch transaksi dari API - PERBAIKAN: Hapus Authorization jika endpoint public
            const response = await fetch(`/api/transaksi/rekening/${noRekening}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.responseCode === '200' && data.data) {
                allTransactions = data.data || [];
                console.log('Transactions loaded:', allTransactions.length);
                
                // Sort by tanggal descending (terbaru duluan)
                allTransactions.sort((a, b) => {
                    const dateA = a.tanggal ? new Date(a.tanggal) : new Date(0);
                    const dateB = b.tanggal ? new Date(b.tanggal) : new Date(0);
                    return dateB - dateA;
                });
                
                // Update rekening info
                updateRekeningInfo(noRekening, userData.nama);
                
                // Update summary
                updateSummary(allTransactions);
                
                // Apply initial filter
                filterTransactions();
            } else {
                throw new Error(data.responseDesc || 'Gagal mengambil transaksi');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            showError('Gagal memuat data transaksi: ' + error.message);
        }
    }
    
    // Inisialisasi
    setupEventListeners();
    loadTransactions();
});