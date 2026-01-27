let API_BASE_URL = '';

async function loadBaseUrl() {
    const res = await fetch('/api/config/base-url');
    const data = await res.json();
    API_BASE_URL = data.baseUrl;
}
document.addEventListener('DOMContentLoaded', async () => {
    await loadBaseUrl();
    loadSaldo();
});





// adminHome.js - Mobile Banking Version (FIXED & COMPLETE)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Home JS Loaded');
    
    // Ambil data user dari localStorage
    const userData = JSON.parse(localStorage.getItem('userData'));
    const authToken = localStorage.getItem('authToken');
    
    // Cek apakah user sudah login
    if (!userData || !authToken) {
        // Jika tidak ada token, redirect ke halaman login
        showAlert('Anda harus login terlebih dahulu', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        return;
    }
    
    console.log('User logged in:', userData);
    
    // Tampilkan informasi user di mobile header
    displayMobileUserInfo(userData);
    
    // Load data saldo pribadi
    loadSaldoSaya();
    
    // Load data statistik koperasi
    loadKoperasiStats();
    
    // Load laba / rugi
    loadLabaRugi();

    // Setup mobile menu
    setupMobileMenu();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update waktu sistem
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
    
    // Auto-refresh saldo setiap 30 detik
    setInterval(loadSaldoSaya, 30000);
    
    // Load total pembiayaan aktif
    loadTotalPembiayaanAktif();
    
    // Fungsi untuk menampilkan informasi user di mobile header
    function displayMobileUserInfo(userData) {
        const userDisplayName = document.getElementById('userDisplayName');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const mobileUserName = document.getElementById('mobileUserName');
        const mobileUserRole = document.getElementById('mobileUserRole');
        
        if (userData.nama) {
            if (userDisplayName) userDisplayName.textContent = userData.nama;
            if (mobileUserName) mobileUserName.textContent = userData.nama;
        }
        
        if (userData.role) {
            if (userRoleDisplay) userRoleDisplay.textContent = userData.role;
            if (mobileUserRole) mobileUserRole.textContent = userData.role;
        }
    }
    
    // Fungsi untuk load saldo saya - TANPA HARCODE
    async function loadSaldoSaya() {
        const saldoElement = document.getElementById('saldoSaya');
        const saldoUpdateTime = document.getElementById('saldoUpdateTime');
        const noRekeningDisplay = document.querySelector('.saldo-details .detail-item span');
        
        try {
            // Show loading state
            if (saldoElement) {
                saldoElement.innerHTML = `
                    <div class="loading-saldo">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Memuat saldo...</span>
                    </div>
                `;
            }
            
            // Ambil user data dari localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            
            // Validasi user data
            if (!userData) {
                throw new Error('Data user tidak ditemukan');
            }
            
            // Ambil no rekening dari userData
            let noRekening = userData.noRekening;
            
            // Jika no rekening tidak ada di localStorage, coba ambil dari API
            if (!noRekening) {
                noRekening = await fetchUserNoRekening(userData.userName);
                
                if (noRekening) {
                    // Simpan ke localStorage
                    userData.noRekening = noRekening;
                    localStorage.setItem('userData', JSON.stringify(userData));
                } else {
                    throw new Error('Nomor rekening tidak ditemukan');
                }
            }
            
            // Update tampilan no rekening
            if (noRekeningDisplay) {
                noRekeningDisplay.textContent = noRekening;
            }
            // Fetch saldo dari API dengan noRekening yang dinamis
            // const response = await fetch(`${API_BASE_URL}/api/transaksi/saldo/${noRekening}`);
            const response = await fetch(`/api/transaksi/saldo/${noRekening}`);

            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.responseCode === '200') {
                // Format saldo
                const saldo = data.data;
                const formattedSaldo = formatRupiah(saldo);
                
                // Update saldo display
                if (saldoElement) {
                    saldoElement.innerHTML = `
                        <div class="saldo-amount-display">
                            <span class="amount">${formattedSaldo}</span>
                        </div>
                    `;
                }
                
                // Update timestamp
                if (saldoUpdateTime) {
                    const now = new Date();
                    saldoUpdateTime.textContent = now.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            } else {
                throw new Error(data.responseDesc || 'Gagal mengambil saldo');
            }
        } catch (error) {
            console.error('Error fetching saldo:', error);
            if (saldoElement) {
                saldoElement.innerHTML = `
                    <div class="saldo-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Gagal memuat saldo</span>
                        <small>${error.message}</small>
                    </div>
                `;
            }
            
            // Tampilkan error di no rekening display juga
            if (noRekeningDisplay) {
                noRekeningDisplay.textContent = 'Tidak tersedia';
            }
        }
    }
    
    // Fungsi untuk mengambil no rekening dari API
    async function fetchUserNoRekening(username) {
        try {
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken || !username) {
                return null;
            }
            
            // Coba ambil data user detail dari API
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
                    // Cek berbagai kemungkinan nama field untuk no rekening
                    const userDetail = data.data;
                    return userDetail.noRekening || 
                           userDetail.accountNumber || 
                           userDetail.rekeningNumber ||
                           userDetail.nomorRekening ||
                           null;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching user detail:', error);
            return null;
        }
    }
    
    // Fungsi untuk load statistik koperasi
    async function loadKoperasiStats() {
        try {
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                throw new Error('Token autentikasi tidak ditemukan');
            }
            
            // Load total dana koperasi
            const response = await fetch('/api/transaksi/saldo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.responseCode === "200") {
                // Format ke Rupiah
                const saldo = formatRupiah(data.data);
                const totalSaldoEl = document.getElementById('totalSaldo');
                if (totalSaldoEl) totalSaldoEl.textContent = saldo;
                
                // Update timestamp
                const now = new Date();
                const lastUpdateEl = document.getElementById('lastUpdate');
                if (lastUpdateEl) {
                    lastUpdateEl.textContent = 
                        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                }
                
                // Update statistik lainnya
                updateStatistics(data.data);
            } else {
                showAlert('Gagal mengambil data statistik', 'warning');
                // Fallback data
                const totalSaldoEl = document.getElementById('totalSaldo');
                if (totalSaldoEl) totalSaldoEl.textContent = 'Rp 0';
                loadFallbackStatistics();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            loadFallbackStatistics();
        }
    }
    
    // Fungsi untuk load total pembiayaan aktif dari API
    async function loadTotalPembiayaanAktif() {
        try {
            console.log('Loading total pembiayaan aktif...');
            
            const response = await fetch('/api/pembiayaan-detail/total-pokok-belum-bayar');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result && result.responseCode === "200" && result.data !== undefined) {
                const total = result.data;
                
                // PERBAIKAN: Gunakan ID yang benar
                const el = document.getElementById('totalPembiayaan2');
                if (el) {
                    el.textContent = formatRupiah(total);
                    console.log('✅ Total Pembiayaan Aktif berhasil dimuat:', total);
                } else {
                    console.error('❌ Element dengan ID totalPembiayaan2 tidak ditemukan');
                    
                    // Coba alternatif
                    const elAlt = document.getElementById('totalPembiayaan');
                    if (elAlt) {
                        elAlt.textContent = formatRupiah(total);
                        console.log('✅ Total Pembiayaan Aktif dimuat ke element alternatif');
                    }
                }
            } else {
                throw new Error(result.responseDesc || 'Invalid response format');
            }
        } catch (err) {
            console.error('❌ Gagal load total pembiayaan:', err);
            
            // Fallback: tampilkan Rp 0 jika gagal
            const el = document.getElementById('totalPembiayaan2') || document.getElementById('totalPembiayaan');
            if (el) {
                el.textContent = 'Rp 0';
                showAlert('Gagal memuat data pembiayaan aktif', 'warning');
            }
        }
    }
    
    // Fungsi untuk fallback statistics
    function loadFallbackStatistics() {
        const fallbackData = {
            totalSaldo: 50000000,
            // todayActivity: 15,
            totalPembiayaan: 25000000,
            activeUsers: 45
        };
        
        const totalSaldoEl = document.getElementById('totalSaldo');
        // const todayActivityEl = document.getElementById('todayActivity');
        const totalPembiayaanEl = document.getElementById('totalPembiayaan2') || document.getElementById('totalPembiayaan');
        const activeUsersEl = document.getElementById('activeUsers');
        
        if (totalSaldoEl) totalSaldoEl.textContent = formatRupiah(fallbackData.totalSaldo);
        // if (todayActivityEl) todayActivityEl.textContent = fallbackData.todayActivity;
        if (totalPembiayaanEl) totalPembiayaanEl.textContent = formatRupiah(fallbackData.totalPembiayaan);
        if (activeUsersEl) activeUsersEl.textContent = fallbackData.activeUsers;
    }
    
    // Fungsi untuk setup mobile menu
    function setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const closeNavBtn = document.getElementById('closeNavBtn');
        const mobileNav = document.getElementById('mobileNav');
        
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Mencegah event bubbling
                console.log('Menu toggle clicked');
                mobileNav.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
            });
        }
        
        if (closeNavBtn && mobileNav) {
            closeNavBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Close menu clicked');
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileNav && mobileNav.classList.contains('active') && 
                !mobileNav.contains(e.target) && 
                e.target !== menuToggle) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Fungsi untuk setup event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Refresh saldo button
        const refreshSaldoBtn = document.getElementById('refreshSaldoBtn');
        if (refreshSaldoBtn) {
            refreshSaldoBtn.addEventListener('click', loadSaldoSaya);
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Quick action buttons
       // Ganti viewReportsBtn dengan viewHistoryBtn
const addUserBtn = document.getElementById('addUserBtn');
const newTransaksiBtn = document.getElementById('newTransaksiBtn');
const managePembiayaanBtn = document.getElementById('managePembiayaanBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn'); // PERUBAHAN DI SINI

if (addUserBtn) addUserBtn.addEventListener('click', showAddUserModal);
if (newTransaksiBtn) newTransaksiBtn.addEventListener('click', showTransaksiModal);

if (managePembiayaanBtn) {
    managePembiayaanBtn.addEventListener('click', function() {
        window.location.href = '/pembiayaan';
    });
}

if (viewHistoryBtn) { // PERUBAHAN DI SINI
    viewHistoryBtn.addEventListener('click', function() {
        // Redirect ke halaman history transaksi
        window.location.href = '/history-transaksi';
    });
}
        
        // Footer navigation
        const footerTransaksiBtn = document.getElementById('footerTransaksiBtn');
        const footerHistoryBtn = document.getElementById('footerHistoryBtn');
        const footerMoreBtn = document.getElementById('footerMoreBtn');
        
        if (footerTransaksiBtn) {
            footerTransaksiBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showTransaksiModal();
            });
        }
        
        if (footerHistoryBtn) {
            footerHistoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showAlert('Fitur riwayat akan segera hadir!', 'info');
            });
        }
        
        if (footerMoreBtn) {
            footerMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Show mobile nav menu
                const mobileNav = document.getElementById('mobileNav');
                if (mobileNav) {
                    mobileNav.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
        
        // Menu navigation items
        const navItems = document.querySelectorAll('.nav-menu .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (this.id === 'dashboardBtn') {
                    e.preventDefault();
                    // Close menu
                    const mobileNav = document.getElementById('mobileNav');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                } else if (this.id === 'userBtn') {
                    e.preventDefault();
                    showAddUserModal();
                    const mobileNav = document.getElementById('mobileNav');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                } else if (this.id === 'transaksiBtn') {
                    e.preventDefault();
                    showTransaksiModal();
                    const mobileNav = document.getElementById('mobileNav');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                } else if (this.id === 'pembiayaanBtn') {
                    e.preventDefault();
                    const mobileNav = document.getElementById('mobileNav');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                    setTimeout(() => {
                        window.location.href = '/pembiayaan';
                    }, 300);
                } else if (this.id === 'reportBtn' || this.id === 'settingsBtn' || this.id === 'helpBtn') {
                    e.preventDefault();
                    showAlert('Fitur ini akan segera hadir!', 'info');
                    const mobileNav = document.getElementById('mobileNav');
                    if (mobileNav) {
                        mobileNav.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                }
            });
        });
        
        // Setup modal events
        setupModalEvents();
    }
    
    // Fungsi untuk setup modal events
    function setupModalEvents() {
        // Add User Modal
        const addUserModal = document.getElementById('addUserModal');
        const closeUserModal = document.getElementById('closeUserModal');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const addUserForm = document.getElementById('addUserForm');
        
        if (closeUserModal) {
            closeUserModal.addEventListener('click', () => {
                if (addUserModal) addUserModal.style.display = 'none';
                if (addUserForm) addUserForm.reset();
            });
        }
        
        if (cancelUserBtn) {
            cancelUserBtn.addEventListener('click', () => {
                if (addUserModal) addUserModal.style.display = 'none';
                if (addUserForm) addUserForm.reset();
            });
        }
        
        if (addUserForm) {
            addUserForm.addEventListener('submit', handleAddUser);
        }
        
        // Transaksi Modal
        const transaksiModal = document.getElementById('transaksiModal');
        const closeTransaksiModal = document.getElementById('closeTransaksiModal');
        const cancelTransaksiBtn = document.getElementById('cancelTransaksiBtn');
        const transaksiForm = document.getElementById('transaksiForm');
        
        if (closeTransaksiModal) {
            closeTransaksiModal.addEventListener('click', () => {
                if (transaksiModal) transaksiModal.style.display = 'none';
                if (transaksiForm) transaksiForm.reset();
                resetTransaksiForm();
            });
        }
        
        if (cancelTransaksiBtn) {
            cancelTransaksiBtn.addEventListener('click', () => {
                if (transaksiModal) transaksiModal.style.display = 'none';
                if (transaksiForm) transaksiForm.reset();
                resetTransaksiForm();
            });
        }
        
        if (transaksiForm) {
            transaksiForm.addEventListener('submit', handleTransaksi);
            setupTransaksiFormValidation();
        }
        
        // Setup search functionality
        const searchRekeningBtn = document.getElementById('searchRekeningBtn');
        if (searchRekeningBtn) {
            searchRekeningBtn.addEventListener('click', searchCustomerByNoRekening);
        }
        
        const noRekeningInput = document.getElementById('noRekening');
        if (noRekeningInput) {
            noRekeningInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchCustomerByNoRekening();
                }
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const addUserModal = document.getElementById('addUserModal');
            const transaksiModal = document.getElementById('transaksiModal');
            
            if (addUserModal && e.target === addUserModal) {
                addUserModal.style.display = 'none';
                const addUserForm = document.getElementById('addUserForm');
                if (addUserForm) addUserForm.reset();
            }
            
            if (transaksiModal && e.target === transaksiModal) {
                transaksiModal.style.display = 'none';
                const transaksiForm = document.getElementById('transaksiForm');
                if (transaksiForm) transaksiForm.reset();
                resetTransaksiForm();
            }
        });
    }
    
    // Fungsi untuk reset form transaksi
    function resetTransaksiForm() {
        const transaksiForm = document.getElementById('transaksiForm');
        if (transaksiForm) transaksiForm.reset();
        
        const customerInfo = document.getElementById('customerInfo');
        if (customerInfo) customerInfo.style.display = 'none';
        
        const transactionSummary = document.getElementById('transactionSummary');
        if (transactionSummary) transactionSummary.style.display = 'none';
        
        const debetGroup = document.getElementById('debetGroup');
        const creditGroup = document.getElementById('creditGroup');
        if (debetGroup) debetGroup.style.display = 'none';
        if (creditGroup) creditGroup.style.display = 'none';
    }
    
    // Fungsi untuk menampilkan modal tambah user
    function showAddUserModal() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Validasi role
        if (userData.role !== 'Administrator') {
            showAlert('Hanya Administrator yang dapat menambah user', 'error');
            return;
        }
        
        const modal = document.getElementById('addUserModal');
        if (!modal) return;
        
        modal.style.display = 'block';
        
        // Reset form
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) addUserForm.reset();
    }
    
    // Fungsi untuk menampilkan modal transaksi
    function showTransaksiModal() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Validasi role
        if (userData.role !== 'Administrator' && userData.role !== 'Operator') {
            showAlert('Hanya Administrator dan Operator yang dapat melakukan transaksi', 'error');
            return;
        }
        
        const modal = document.getElementById('transaksiModal');
        if (!modal) return;
        
        modal.style.display = 'block';
        
        // Reset form
        resetTransaksiForm();
        
        // Fokus ke input no rekening
        setTimeout(() => {
            const noRekeningInput = document.getElementById('noRekening');
            if (noRekeningInput) noRekeningInput.focus();
        }, 100);
    }
    
    // Fungsi untuk handle tambah user
    async function handleAddUser(e) {
        e.preventDefault();
        
        const formData = {
            userName: document.getElementById('newUsername').value.trim(),
            password: document.getElementById('newPassword').value,
            nama: document.getElementById('newNama').value.trim(),
            noTelp: document.getElementById('newTelp').value.trim(),
            alamat: document.getElementById('newAlamat').value.trim(),
            role: document.getElementById('newRole').value
        };
        
        // Validasi
        if (!formData.userName || !formData.password || !formData.nama || !formData.role) {
            showAlert('Username, Password, Nama, dan Role harus diisi', 'error');
            return;
        }
        
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.responseCode === "200" || result.responseCode === "201") {
                showAlert(`User ${formData.nama} berhasil ditambahkan!`, 'success');
                
                // Tutup modal
                const addUserModal = document.getElementById('addUserModal');
                if (addUserModal) addUserModal.style.display = 'none';
                
                // Reset form
                const addUserForm = document.getElementById('addUserForm');
                if (addUserForm) addUserForm.reset();
                
            } else {
                showAlert(`Gagal menambahkan user: ${result.responseDesc || 'Unknown error'}`, 'error');
            }
            
        } catch (error) {
            showAlert('Gagal menambahkan user: ' + error.message, 'error');
            console.error('Add user error:', error);
        }
    }
    
    // Fungsi untuk handle transaksi
    async function handleTransaksi(e) {
        e.preventDefault();
        console.log('=== TRANSACTION FORM SUBMITTED ===');
        
        // Ambil data form
        const noRekening = document.getElementById('noRekening').value.trim();
        const nama = document.getElementById('nama').value.trim();
        const transaksiType = document.getElementById('transaksiType').value;
        const keterangan = document.getElementById('transaksiDescription').value.trim();
        
        // Validasi dasar
        if (!noRekening) {
            showAlert('Nomor rekening harus diisi', 'error');
            return;
        }
        
        if (!nama) {
            showAlert('Silakan cari nasabah terlebih dahulu', 'error');
            return;
        }
        
        if (!transaksiType) {
            showAlert('Jenis transaksi harus dipilih', 'error');
            return;
        }
        
        // Ambil amount dari field yang sesuai
        let amount = '';
        if (transaksiType === 'deposit') {
            const creditInput = document.getElementById('credit');
            amount = creditInput ? creditInput.value.replace(/[^0-9]/g, '') : '';
        } else if (transaksiType === 'withdraw') {
            const debetInput = document.getElementById('debet');
            amount = debetInput ? debetInput.value.replace(/[^0-9]/g, '') : '';
        }
        
        // Validasi amount
        if (!amount || parseInt(amount) <= 0) {
            showAlert('Jumlah transaksi harus lebih dari 0', 'error');
            return;
        }
        
        // Siapkan payload
        const payload = {
            noRekening: noRekening,
            nama: nama,
            keterangan: keterangan
        };
        
        // Tambahkan debet/credit sesuai jenis transaksi
        if (transaksiType === 'deposit') {
            payload.credit = parseInt(amount);
            payload.debet = 0;
        } else if (transaksiType === 'withdraw') {
            payload.debet = parseInt(amount);
            payload.credit = 0;
        }
        
        console.log('Payload to API:', payload);
        
        // Konfirmasi
        const amountFormatted = parseInt(amount).toLocaleString('id-ID');
        const actionType = transaksiType === 'deposit' ? 'Setor Dana' : 'Penarikan';
        if (!confirm(`Proses ${actionType} sebesar Rp ${amountFormatted} untuk rekening ${noRekening}?`)) {
            return;
        }
        
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch('/api/transaksi/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            console.log('API Result:', result);
            
            if (result.responseCode === "200" || result.responseCode === "201") {
                showAlert('Transaksi berhasil diproses!', 'success');
                // Tutup modal
                const transaksiModal = document.getElementById('transaksiModal');
                if (transaksiModal) transaksiModal.style.display = 'none';
                // Reset form
                resetTransaksiForm();
                // Reload data
                loadSaldoSaya();
                loadKoperasiStats();
                loadTotalPembiayaanAktif();
            } else {
                showAlert('Gagal: ' + (result.responseDesc || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Terjadi kesalahan: ' + error.message, 'error');
        }
    }
    
    // Fungsi untuk setup validasi form transaksi
    function setupTransaksiFormValidation() {
        const transaksiTypeSelect = document.getElementById('transaksiType');
        const debetGroup = document.getElementById('debetGroup');
        const creditGroup = document.getElementById('creditGroup');
        const amountInput = document.getElementById('transaksiAmount');
        
        if (transaksiTypeSelect) {
            transaksiTypeSelect.addEventListener('change', function() {
                const type = this.value;
                console.log('Transaction type changed to:', type);
                
                if (type === 'withdraw') {
                    if (debetGroup) debetGroup.style.display = 'block';
                    if (creditGroup) creditGroup.style.display = 'none';
                } else if (type === 'deposit') {
                    if (creditGroup) creditGroup.style.display = 'block';
                    if (debetGroup) debetGroup.style.display = 'none';
                } else {
                    if (debetGroup) debetGroup.style.display = 'none';
                    if (creditGroup) creditGroup.style.display = 'none';
                }
            });
        }
        
        // Format amount inputs
        const amountInputs = document.querySelectorAll('.amount-input');
        amountInputs.forEach(input => {
            input.addEventListener('input', function() {
                let value = this.value.replace(/[^0-9]/g, '');
                if (value) {
                    this.value = parseInt(value).toLocaleString('id-ID');
                }
            });
        });
        
        // Setup amount sync between fields
        if (amountInput) {
            amountInput.addEventListener('input', function() {
                const type = document.getElementById('transaksiType').value;
                const value = this.value.replace(/[^0-9]/g, '');
                
                if (type === 'withdraw') {
                    const debetInput = document.getElementById('debet');
                    if (debetInput) {
                        debetInput.value = value ? parseInt(value).toLocaleString('id-ID') : '';
                    }
                } else if (type === 'deposit') {
                    const creditInput = document.getElementById('credit');
                    if (creditInput) {
                        creditInput.value = value ? parseInt(value).toLocaleString('id-ID') : '';
                    }
                }
            });
        }
    }
    
    // Fungsi untuk search customer by no rekening
    async function searchCustomerByNoRekening() {
        const noRekeningInput = document.getElementById('noRekening');
        const namaInput = document.getElementById('nama');
        const customerInfo = document.getElementById('customerInfo');
        const customerName = document.getElementById('customerName');
        const customerPhone = document.getElementById('customerPhone');
        
        if (!noRekeningInput) return;
        
        const noRekening = noRekeningInput.value.trim();
        
        if (!noRekening) {
            showAlert('Silakan masukkan no rekening', 'error');
            noRekeningInput.focus();
            return;
        }
        
        // Tampilkan loading
        showAlert('Mencari data nasabah...', 'info');
        
        try {
            const authToken = localStorage.getItem('authToken');
            const response = await fetch(`/api/users/rekening/${noRekening}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            console.log('Search response:', data);
            
            if (data.responseCode === "200" && data.data) {
                // Sukses mendapatkan data
                const customer = data.data;
                
                // Isi data ke form
                if (namaInput) namaInput.value = customer.nama || customer.userName || '';
                
                // Tampilkan info customer
                if (customerName) customerName.textContent = customer.nama || customer.userName || '-';
                if (customerPhone) customerPhone.textContent = customer.noTelp || '-';
                if (customerInfo) customerInfo.style.display = 'block';
                
                // Update border menjadi hijau (success)
                noRekeningInput.classList.remove('error-border');
                noRekeningInput.classList.add('success-border');
                
                showAlert(`Data nasabah ditemukan: ${customer.nama || customer.userName}`, 'success');
                
                // Fokus ke jenis transaksi
                const transaksiType = document.getElementById('transaksiType');
                if (transaksiType) transaksiType.focus();
                
            } else {
                // Data tidak ditemukan
                if (namaInput) namaInput.value = '';
                if (customerInfo) customerInfo.style.display = 'none';
                noRekeningInput.classList.add('error-border');
                noRekeningInput.classList.remove('success-border');
                
                showAlert(`Nasabah dengan no rekening ${noRekening} tidak ditemukan`, 'error');
            }
            
        } catch (error) {
            console.error('Error searching customer:', error);
            showAlert('Gagal mencari data nasabah: ' + error.message, 'error');
            noRekeningInput.classList.add('error-border');
        }
    }
    
    // Fungsi untuk handle logout
    function handleLogout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            // Hapus data dari localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Tampilkan pesan logout
            showAlert('Logout berhasil, mengarahkan ke halaman login...', 'success');
            
            // Redirect ke halaman login
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }
    }
    
    // Fungsi untuk update statistik
    function updateStatistics(saldo) {
        // Update data statistik berdasarkan saldo
        // const todayActivity = Math.floor(Math.random() * 50) + 10;
        const activeUsers = Math.floor(Math.random() * 100) + 50;
        
        // const todayActivityEl = document.getElementById('todayActivity');
        const activeUsersEl = document.getElementById('activeUsers');
        
        // if (todayActivityEl) todayActivityEl.textContent = todayActivity;
        if (activeUsersEl) activeUsersEl.textContent = activeUsers;
        
        // Total pembiayaan sudah diambil dari API terpisah
        // Jadi tidak perlu diupdate di sini
    }
    
    // Fungsi untuk update waktu sistem
    function updateSystemTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const systemTimeEl = document.getElementById('systemTime');
        if (systemTimeEl) systemTimeEl.textContent = `${timeString}, ${dateString}`;
    }
    
    // Fungsi untuk format Rupiah
    function formatRupiah(number) {
        if (!number && number !== 0) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    }
    
    // Fungsi untuk menampilkan alert (IMPROVED)
    function showAlert(message, type) {
        // Cek apakah alert sudah ada
        let alertDiv = document.querySelector('.alert-message');
        
        // Jika sudah ada, hapus dulu
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
        
        // Buat element alert baru
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
        
        // Set warna berdasarkan type
        const colors = {
            'error': '#e74c3c',
            'success': '#2ecc71',
            'info': '#3498db',
            'warning': '#f39c12'
        };
        
        alertDiv.style.backgroundColor = colors[type] || colors.info;
        alertDiv.innerHTML = message;
        
        // Sembunyikan alert setelah 3 detik
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
        
        // Tambahkan CSS animation jika belum ada
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
});

// Di dalam fungsi setupEventListeners() di adminHome.js
const footerHistoryBtn = document.getElementById('footerHistoryBtn');
if (footerHistoryBtn) {
    footerHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Arahkan ke halaman history
        window.location.href = '/history-transaksi';
    });
}

// Juga untuk menu navigation
const navHistoryBtn = document.getElementById('historyBtn'); // Anda perlu menambahkan item menu di HTML
if (navHistoryBtn) {
    navHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        setTimeout(() => {
            window.location.href = '/history-transaksi';
        }, 300);
    });
}

// Load total laba / rugi hari ini
function loadLabaRugi() {
    fetch('/api/pendapatan/total')
        .then(response => response.json())
        .then(result => {
            console.log('Response laba/rugi:', result);

            const el = document.getElementById('todayActivity');
            if (!el) return;

            if (result.responseCode === '00') {
                el.textContent = formatRupiah(result.data ?? 0);
            } else {
                el.textContent = 'Rp 0';
            }
        })
        .catch(error => {
            console.error('Error load laba/rugi:', error);
        });
}
function formatRupiah(angka) {
    if (angka === null || angka === undefined) return 'Rp 0';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2
    }).format(angka);
}
