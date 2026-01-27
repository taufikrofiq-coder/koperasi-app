package com.danaku.danaku.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.danaku.danaku.entity.pembiayaanDetailEntity;
import com.danaku.danaku.entity.pembiayaanEntity;
import com.danaku.danaku.entity.pendapatanEntity;
import com.danaku.danaku.entity.transaksiEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.repository.PembiayaanDetailRepository;
import com.danaku.danaku.repository.PembiayaanRepository;
import com.danaku.danaku.repository.PendapatanRepository;
import com.danaku.danaku.repository.transaksiRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PembayaranAngsuranServiceImpl implements PembayaranAngsuranService {

    private static final Logger logger = LoggerFactory.getLogger(PembayaranAngsuranServiceImpl.class);

    @Autowired
    private PembiayaanDetailRepository pembiayaanDetailRepository;

    @Autowired
    private transaksiRepository transaksiRepository;

    @Autowired
    private PendapatanRepository pendapatanRepository;

    @Autowired
    private PembiayaanRepository pembiayaanRepository;

    @Override
    public GeneralResponseDto<?> bayarAngsuran(Long detailId) {
        
        logger.info("========== MEMULAI PROSES PEMBAYARAN ANGSURAN ==========");
        logger.info("Detail ID: {}", detailId);
        logger.info("Waktu: {}", LocalDateTime.now());
        
        try {
            // =============================
            // 1️⃣ CEK DAN AMBIL DATA ANGSURAN
            // =============================
            logger.info("1. Mencari data angsuran dengan ID: {}", detailId);
            pembiayaanDetailEntity detail = pembiayaanDetailRepository
                    .findById(detailId)
                    .orElseThrow(() -> {
                        logger.error("❌ Data angsuran tidak ditemukan dengan ID: {}", detailId);
                        return new RuntimeException("Data angsuran tidak ditemukan");
                    });
            
            logger.info("✅ Data angsuran ditemukan:");
            logger.info("   - No Angsuran: {}", detail.getNo());
            logger.info("   - No Pembiayaan: {}", detail.getNoPembiayaan());
            logger.info("   - Nasabah: {}", detail.getNama());
            logger.info("   - No Rekening: {}", detail.getNoRekening());
            logger.info("   - Status: {}", detail.getStatus());
            logger.info("   - Cicilan: {}", detail.getCicilan());
            logger.info("   - Pokok: {}", detail.getPokok());
            logger.info("   - Bunga: {}", detail.getBunga());
            logger.info("   - Tanggal Jatuh Tempo: {}", detail.getTanggalJatuhTempo());

            // ❌ Cegah bayar dua kali
            logger.info("2. Memeriksa status angsuran...");
            if ("LUNAS".equalsIgnoreCase(detail.getStatus())) {
                logger.warn("⚠️ Angsuran sudah berstatus LUNAS");
                logger.warn("   Tidak dapat melakukan pembayaran ulang");
                return new GeneralResponseDto<>(
                        "400",
                        "Angsuran sudah dibayar",
                        null
                );
            }
            logger.info("✅ Status angsuran valid (BELUM BAYAR)");

            // =============================
            // 2️⃣ UPDATE PEMBIAYAAN DETAIL
            // =============================
            logger.info("3. Memulai update data pembiayaan detail...");
            String statusSebelum = detail.getStatus();
            detail.setStatus("LUNAS");
            detail.setTanggalBayar(LocalDate.now());
            detail.setTanggal(LocalDateTime.now());
            
            logger.info("   - Status berubah: {} → LUNAS", statusSebelum);
            logger.info("   - Tanggal Bayar: {}", detail.getTanggalBayar());
            
            pembiayaanDetailEntity savedDetail = pembiayaanDetailRepository.save(detail);
            logger.info("✅ Data pembiayaan detail berhasil diupdate");
            logger.info("   - ID Detail: {}", savedDetail.getId());

            // =============================
            // 3️⃣ INSERT TRANSAKSI (POKOK)
            // =============================
            logger.info("4. Membuat transaksi untuk pokok pinjaman...");
            transaksiEntity transaksi = new transaksiEntity();
            transaksi.setNoRekening(detail.getNoPembiayaan()); // SESUAI PERMINTAAN
            transaksi.setNama(detail.getNama());
            transaksi.setDebet("0");
            transaksi.setCredit(detail.getPokok());
            transaksi.setKeterangan(
                    detail.getNo() + " " + detail.getNoPembiayaan()
            );
            transaksi.setTanggal(LocalDateTime.now());
            
            logger.info("   - Data Transaksi:");
            logger.info("     * No Rekening: {}", transaksi.getNoRekening());
            logger.info("     * Nama: {}", transaksi.getNama());
            logger.info("     * Debet: {}", transaksi.getDebet());
            logger.info("     * Credit: {}", transaksi.getCredit());
            logger.info("     * Keterangan: {}", transaksi.getKeterangan());
            
            transaksiEntity savedTransaksi = transaksiRepository.save(transaksi);
            logger.info("✅ Transaksi pokok berhasil disimpan");
            logger.info("   - ID Transaksi: {}", savedTransaksi.getId());

            // =============================
            // 4️⃣ INSERT PENDAPATAN (BUNGA)
            // =============================
            logger.info("5. Membuat pendapatan untuk bunga...");
            pendapatanEntity pendapatan = new pendapatanEntity();
            pendapatan.setNoPembiayaan(detail.getNoPembiayaan());
            pendapatan.setDebet("0");
            pendapatan.setCredit(detail.getBunga());
            pendapatan.setKeterangan(
                    detail.getNo() + " " + detail.getNoPembiayaan()
            );
            pendapatan.setTanggal(LocalDateTime.now());
            
            logger.info("   - Data Pendapatan:");
            logger.info("     * No Pembiayaan: {}", pendapatan.getNoPembiayaan());
            logger.info("     * Debet: {}", pendapatan.getDebet());
            logger.info("     * Credit: {}", pendapatan.getCredit());
            logger.info("     * Keterangan: {}", pendapatan.getKeterangan());
            
            pendapatanEntity savedPendapatan = pendapatanRepository.save(pendapatan);
            logger.info("✅ Pendapatan bunga berhasil disimpan");
            logger.info("   - ID Pendapatan: {}", savedPendapatan.getId());

            // =============================
            // 5️⃣ SUMMARY PEMBAYARAN
            // =============================
            logger.info("6. Summary pembayaran angsuran:");
            logger.info("   - Total Cicilan: {}", detail.getCicilan());
            logger.info("   - Pokok yang dibayar: {}", detail.getPokok());
            logger.info("   - Bunga yang dibayar: {}", detail.getBunga());
            logger.info("   - Total Pembayaran: {}", 
                Double.parseDouble(detail.getPokok()) + Double.parseDouble(detail.getBunga()));

            // =============================
            // 6️⃣ CEK SEMUA ANGSURAN LUNAS?
            // =============================
            logger.info("7. Mengecek seluruh status angsuran untuk pembiayaan: {}", detail.getNoPembiayaan());

            // cek apakah masih ada angsuran BELUM BAYAR
            boolean masihAdaBelumBayar = pembiayaanDetailRepository
                    .existsByNoPembiayaanAndStatusIgnoreCase(
                            detail.getNoPembiayaan(),
                            "BELUM BAYAR"
                    );

            if (masihAdaBelumBayar) {
                logger.info("⚠️ Masih terdapat angsuran BELUM BAYAR");
                logger.info("➡️ Status pembiayaan TIDAK diupdate");
            } else {
                logger.info("✅ Semua angsuran sudah LUNAS");
                logger.info("➡️ Memperbarui status pembiayaan menjadi LUNAS");

                pembiayaanEntity pembiayaan = pembiayaanRepository
                        .findByNoPembiayaan(detail.getNoPembiayaan())
                        .orElseThrow(() -> {
                            logger.error("❌ Data pembiayaan tidak ditemukan: {}", detail.getNoPembiayaan());
                            return new RuntimeException("Data pembiayaan tidak ditemukan");
                        });

                String statusSebelumPembiayaan = pembiayaan.getStatus();
                pembiayaan.setStatus("LUNAS");
                pembiayaan.setTanggal(LocalDateTime.now());

                pembiayaanRepository.save(pembiayaan);

                logger.info("✅ Status pembiayaan berhasil diupdate: {} → LUNAS", statusSebelumPembiayaan);
            }

            logger.info("========== PROSES PEMBAYARAN BERHASIL ==========");
            logger.info("✅ Pembayaran angsuran {} untuk {} berhasil diproses", 
                detail.getNo(), detail.getNama());

            // Return success response
            return new GeneralResponseDto<>(
                    "200",
                    "Pembayaran angsuran berhasil",
                    detail
            );

        } catch (RuntimeException e) {
            logger.error("❌ ERROR dalam proses pembayaran angsuran:");
            logger.error("   - Detail ID: {}", detailId);
            logger.error("   - Error Message: {}", e.getMessage());
            logger.error("   - Error Type: {}", e.getClass().getSimpleName());
            logger.error("========== PROSES PEMBAYARAN GAGAL ==========");
            
            // Re-throw untuk ditangkap oleh controller
            throw e;
            
        } catch (Exception e) {
            logger.error("❌ UNEXPECTED ERROR dalam proses pembayaran angsuran:");
            logger.error("   - Detail ID: {}", detailId);
            logger.error("   - Error Message: {}", e.getMessage());
            logger.error("   - Error Type: {}", e.getClass().getSimpleName());
            logger.error("   - Stack Trace:", e);
            logger.error("========== PROSES PEMBAYARAN GAGAL ==========");
            
            throw new RuntimeException("Terjadi kesalahan sistem dalam memproses pembayaran", e);
        }
    }
}