package com.danaku.danaku.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.danaku.danaku.entity.pembiayaanDetailEntity;
import com.danaku.danaku.entity.pembiayaanEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.PembiayaanInquiryResponseDto;
import com.danaku.danaku.model.PembiayaanRequestDto;
import com.danaku.danaku.model.PembiayaanSimulasiRequestDto;
import com.danaku.danaku.model.PembiayaanSimulasiResponseDto;
import com.danaku.danaku.model.SimulasiCicilanDto;
import com.danaku.danaku.repository.PembiayaanDetailRepository;
import com.danaku.danaku.repository.PembiayaanRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PembiayaanServiceImpl implements PembiayaanService {

    @Autowired
    private PembiayaanRepository pembiayaanRepository;

    @Autowired
    private PembiayaanDetailRepository pembiayaanDetailRepository;

    // =====================================================
    // CREATE PEMBIAYAAN
    // =====================================================
    @Override
    public GeneralResponseDto<?> createPembiayaan(PembiayaanRequestDto request) {

        String noPembiayaan = generateNoPembiayaan();

        pembiayaanEntity pembiayaan = new pembiayaanEntity();
       
        pembiayaan.setNama(request.getNama());
        pembiayaan.setNoRekening(request.getNoRekening());
        pembiayaan.setNoPembiayaan(noPembiayaan);
        pembiayaan.setJangkaWaktu(request.getJangkaWaktu().toString());
        pembiayaan.setTanggalAwalPembiayaan(request.getTanggalAwalPembiayaan());
        pembiayaan.setStatus("AKTIF");

        pembiayaan.setTanggalAkhirPembiayaan(
        request.getTanggalAwalPembiayaan().plusMonths(request.getJangkaWaktu())
        );
        pembiayaan.setTanggal(LocalDateTime.now());

        pembiayaanRepository.save(pembiayaan);

        generateCicilanBulanan(
                pembiayaan,
                request.getSaldoAwal(),
                request.getBunga(),
                request.getJangkaWaktu()
        );

        return new GeneralResponseDto<>(
                "200",
                "Pembiayaan & cicilan berhasil dibuat",
                pembiayaan
        );
    }

    // =====================================================
    // INQUIRY BY NO PEMBIAYAAN
    // =====================================================
    @Override
    public GeneralResponseDto<?> inquiryByNoPembiayaan(String noPembiayaan) {

        pembiayaanEntity pembiayaan = pembiayaanRepository
                .findByNoPembiayaan(noPembiayaan)
                .orElseThrow(() ->
                        new RuntimeException("No Pembiayaan tidak ditemukan"));

        List<pembiayaanDetailEntity> details =
                pembiayaanDetailRepository
                        .findByNoPembiayaanOrderByTanggalJatuhTempoAsc(noPembiayaan);

        PembiayaanInquiryResponseDto response = new PembiayaanInquiryResponseDto();
        response.setPembiayaan(pembiayaan);
        response.setJadwalCicilan(details);

        return new GeneralResponseDto<>(
                "200",
                "Inquiry pembiayaan berhasil",
                response
        );
    }

    // =====================================================
    // GENERATE CICILAN TETAP (ANUITAS)
    // =====================================================
   private void generateCicilanBulanan(
        pembiayaanEntity p,
        BigDecimal pinjaman,
        BigDecimal bungaTahunanPersen,
        Integer tenor
) {
    // ===============================
    // BUNGA TAHUNAN ➜ BULANAN
    // ===============================
    BigDecimal r = bungaTahunanPersen
            .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP) // %
            .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP); // per bulan

    // ===============================
    // CICILAN TETAP (ANUITAS)
    // ===============================
    BigDecimal cicilanTetap = pinjaman.multiply(r)
            .divide(
                    BigDecimal.ONE.subtract(
                            BigDecimal.ONE.add(r).pow(-tenor, MathContext.DECIMAL64)
                    ),
                    2,
                    RoundingMode.HALF_UP
            );

    BigDecimal sisaPokok = pinjaman;

    for (int i = 1; i <= tenor; i++) {

        BigDecimal bunga = sisaPokok.multiply(r)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal pokok = cicilanTetap.subtract(bunga)
                .setScale(2, RoundingMode.HALF_UP);

        // Penyesuaian bulan terakhir (seperti bank)
        if (i == tenor) {
            pokok = sisaPokok;
            cicilanTetap = pokok.add(bunga);
        }

        pembiayaanDetailEntity detail = new pembiayaanDetailEntity();
        detail.setNo("Angsuran ke " + i);
        detail.setNama(p.getNama());
        detail.setNoRekening(p.getNoRekening());
        detail.setNoPembiayaan(p.getNoPembiayaan());
        detail.setTanggalJatuhTempo(
                p.getTanggalAwalPembiayaan().plusMonths(i)
        );
        detail.setSaldoAwal(sisaPokok.toString());
        detail.setPokok(pokok.toString());
        detail.setBunga(bunga.toString());
       
        detail.setCicilan(cicilanTetap.toString());
        detail.setStatus("BELUM BAYAR");
        detail.setTanggal(LocalDateTime.now());

        pembiayaanDetailRepository.save(detail);

        sisaPokok = sisaPokok.subtract(pokok);
    }
}


    // =====================================================
    // GENERATE NO PEMBIAYAAN
    // =====================================================
    private String generateNoPembiayaan() {
        String prefix = "MJD";

        Long lastId = pembiayaanRepository
                .findTopByOrderByIdDesc()
                .map(pembiayaanEntity::getId)
                .orElse(0L);

        return prefix + String.format("%010d", lastId + 1);
    }
    @Override
public GeneralResponseDto<?> simulasiPembiayaan(PembiayaanSimulasiRequestDto request) {

    BigDecimal pinjaman = request.getSaldoAwal();
    Integer tenor = request.getJangkaWaktu();

    // bunga tahunan → bulanan
    BigDecimal r = request.getBungaTahunan()
            .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
            .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

    // cicilan tetap (anuitas)
    BigDecimal cicilanTetap = pinjaman.multiply(r)
            .divide(
                    BigDecimal.ONE.subtract(
                            BigDecimal.ONE.add(r).pow(-tenor, MathContext.DECIMAL64)
                    ),
                    2,
                    RoundingMode.HALF_UP
            );

    BigDecimal sisaPokok = pinjaman;
    BigDecimal totalBunga = BigDecimal.ZERO;

    List<SimulasiCicilanDto> jadwal = new ArrayList<>();

    for (int i = 1; i <= tenor; i++) {

        BigDecimal bunga = sisaPokok.multiply(r)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal pokok = cicilanTetap.subtract(bunga)
                .setScale(2, RoundingMode.HALF_UP);

        if (i == tenor) {
            pokok = sisaPokok;
            cicilanTetap = pokok.add(bunga);
        }

        SimulasiCicilanDto dto = new SimulasiCicilanDto();
        dto.setBulanKe(i);
        dto.setTanggalJatuhTempo(request.getTanggalMulai().plusMonths(i));
        dto.setSaldoAwal(sisaPokok);
        dto.setPokok(pokok);
        dto.setBunga(bunga);
        dto.setCicilan(cicilanTetap);

        jadwal.add(dto);

        totalBunga = totalBunga.add(bunga);
        sisaPokok = sisaPokok.subtract(pokok);
    }

    PembiayaanSimulasiResponseDto response = new PembiayaanSimulasiResponseDto();
    response.setCicilanBulanan(jadwal.get(0).getCicilan());
    response.setTotalBunga(totalBunga);
    response.setTotalPembayaran(pinjaman.add(totalBunga));
    response.setJadwal(jadwal);

    return new GeneralResponseDto<>(
            "200",
            "Simulasi pembiayaan berhasil",
            response
    );
}

// =====================================================
// GET ALL PEMBIAYAAN
// =====================================================
@Override
public GeneralResponseDto<?> getAllPembiayaan() {

    List<pembiayaanEntity> list = pembiayaanRepository.findAll();

    return new GeneralResponseDto<>(
            "200",
            "Berhasil mengambil seluruh data pembiayaan",
            list
    );
}

// =====================================================
// GET PEMBIAYAAN BY NO REKENING
// =====================================================
@Override
public GeneralResponseDto<?> getPembiayaanByNoRekening(String noRekening) {

    List<pembiayaanEntity> list =
            pembiayaanRepository.findByNoRekening(noRekening);

    if (list.isEmpty()) {
        return new GeneralResponseDto<>(
                "404",
                "Data pembiayaan dengan no rekening tersebut tidak ditemukan",
                list
        );
    }

    return new GeneralResponseDto<>(
            "200",
            "Berhasil mengambil data pembiayaan berdasarkan no rekening",
            list
    );
}

@Override
public GeneralResponseDto<?> inquiryNextAngsuran(String noPembiayaan) {

    // validasi pembiayaan ada
    pembiayaanRepository
            .findByNoPembiayaan(noPembiayaan)
            .orElseThrow(() ->
                    new RuntimeException("No Pembiayaan tidak ditemukan"));

    // ambil 1 angsuran BELUM BAYAR paling awal
    pembiayaanDetailEntity nextAngsuran =
            pembiayaanDetailRepository
                    .findNextUnpaidByNoPembiayaan(
                            noPembiayaan,
                            PageRequest.of(0, 1)
                    )
                    .stream()
                    .findFirst()
                    .orElse(null);

    if (nextAngsuran == null) {
        return new GeneralResponseDto<>(
                "404",
                "Tidak ada angsuran yang belum dibayar",
                null
        );
    }

    return new GeneralResponseDto<>(
            "200",
            "Inquiry angsuran terdekat berhasil",
            nextAngsuran
    );
}


}
