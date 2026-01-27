package com.danaku.danaku.service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.danaku.danaku.entity.transaksiEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.TransaksiRequestDto;
import com.danaku.danaku.repository.transaksiRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class transaksiService {

    private static final Logger logger = LoggerFactory.getLogger(transaksiService.class);

    private final transaksiRepository transaksiRepository;

    public transaksiService(transaksiRepository transaksiRepository) {
        this.transaksiRepository = transaksiRepository;
    }

   
@Transactional
public GeneralResponseDto<String> createTransaksi(TransaksiRequestDto request) {

    GeneralResponseDto<String> response = new GeneralResponseDto<>();

    try {
        BigDecimal debet = toBigDecimal(request.getDebet());
        BigDecimal credit = toBigDecimal(request.getCredit());

        // 🔹 Ambil saldo saat ini
        BigDecimal totalCredit = toBigDecimal(
                transaksiRepository.totalCreditByNoRekening(request.getNoRekening())
        );

        BigDecimal totalDebet = toBigDecimal(
                transaksiRepository.totalDebetByNoRekening(request.getNoRekening())
        );

        BigDecimal saldo = totalCredit.subtract(totalDebet);

        // 🔴 VALIDASI SALDO
        if (debet.compareTo(BigDecimal.ZERO) > 0 && saldo.compareTo(debet) < 0) {
            response.setResponseCode("400");
            response.setResponseDesc("Saldo tidak cukup");
            response.setData("SALDO_KURANG");
            return response;
        }

        transaksiEntity transaksi = new transaksiEntity();
        transaksi.setNoRekening(request.getNoRekening());
        transaksi.setNama(request.getNama());
        transaksi.setDebet(debet.toPlainString());   // simpan string
        transaksi.setCredit(credit.toPlainString()); // simpan string
        transaksi.setKeterangan(request.getKeterangan());
        transaksi.setTanggal(
                request.getTanggal() != null ? request.getTanggal() : LocalDateTime.now()
        );

        transaksiRepository.save(transaksi);

        response.setResponseCode("200");
        response.setResponseDesc("Transaksi berhasil");
        response.setData("SUCCESS");
        return response;

    } catch (Exception e) {
        log.error("Error create transaksi", e);
        response.setResponseCode("500");
        response.setResponseDesc("Gagal membuat transaksi");
        return response;
    }
}


        private BigDecimal toBigDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(value.replace(",", ""));
    }


    // ✅ GET ALL TRANSAKSI
    public GeneralResponseDto<List<transaksiEntity>> getAllTransaksi() {
        logger.info("Mengambil semua data transaksi");

        try {
            List<transaksiEntity> list = transaksiRepository.findAll();

            GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
            response.setResponseCode("200");
            response.setResponseDesc("Sukses mendapatkan semua transaksi");
            response.setData(list);
            return response;

        } catch (Exception e) {
            logger.error("Error get all transaksi: {}", e.getMessage(), e);

            GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
            response.setResponseCode("500");
            response.setResponseDesc("Gagal mendapatkan data transaksi");
            return response;
        }
    }

    // ✅ GET TRANSAKSI BY NO REKENING
    // public GeneralResponseDto<List<transaksiEntity>> getTransaksiByNoRekening(String noRekening) {
    //     logger.info("Mengambil transaksi untuk noRekening: {}", noRekening);

    //     try {
    //         List<transaksiEntity> list = transaksiRepository.findByNoRekening(noRekening);

    //         if (list.isEmpty()) {
    //             GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
    //             response.setResponseCode("404");
    //             response.setResponseDesc("Transaksi tidak ditemukan");
    //             return response;
    //         }

    //         GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
    //         response.setResponseCode("200");
    //         response.setResponseDesc("Sukses mendapatkan transaksi berdasarkan noRekening");
    //         response.setData(list);
    //         return response;

    //     } catch (Exception e) {
    //         logger.error("Error get transaksi by noRekening: {}", e.getMessage(), e);

    //         GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
    //         response.setResponseCode("500");
    //         response.setResponseDesc("Gagal mendapatkan data transaksi");
    //         return response;
    //     }
    // }


public GeneralResponseDto<List<transaksiEntity>> getTransaksiByNoRekening(String noRekening) {
    logger.info("Mengambil transaksi 6 bulan terakhir untuk noRekening: {}", noRekening);

    try {
        // Hitung tanggal 6 bulan yang lalu
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        
        // Gunakan query yang sudah memfilter
        List<transaksiEntity> list = transaksiRepository.findByNoRekeningAndTanggalAfter(noRekening, sixMonthsAgo);

        if (list.isEmpty()) {
            GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
            response.setResponseCode("404");
            response.setResponseDesc("Transaksi tidak ditemukan dalam 6 bulan terakhir");
            return response;
        }

        GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
        response.setResponseCode("200");
        response.setResponseDesc("Sukses mendapatkan transaksi 6 bulan terakhir berdasarkan noRekening");
        response.setData(list);
        return response;

    } catch (Exception e) {
        logger.error("Error get transaksi by noRekening: {}", e.getMessage(), e);

        GeneralResponseDto<List<transaksiEntity>> response = new GeneralResponseDto<>();
        response.setResponseCode("500");
        response.setResponseDesc("Gagal mendapatkan data transaksi");
        return response;
    }
}

    public GeneralResponseDto<BigDecimal> getTotalDanaByNoRekening(String noRekening) {

    try {
        BigDecimal totalDana =
                transaksiRepository.getTotalDanaByNoRekening(noRekening);

        GeneralResponseDto<BigDecimal> response = new GeneralResponseDto<>();
        response.setResponseCode("200");
        response.setResponseDesc("Sukses mendapatkan total dana");
        response.setData(totalDana);

        return response;

    } catch (Exception e) {
    log.error("Error hitung total dana", e);

    GeneralResponseDto<BigDecimal> response = new GeneralResponseDto<>();
    response.setResponseCode("500");
    response.setResponseDesc("Gagal menghitung total dana: " + e.getMessage());
    return response;
}

}



public GeneralResponseDto<BigDecimal> getTotalDanaAll() {

    try {
        BigDecimal totalDana = transaksiRepository.getTotalDanaAll();

        GeneralResponseDto<BigDecimal> response = new GeneralResponseDto<>();
        response.setResponseCode("200");
        response.setResponseDesc("Sukses mendapatkan total dana semua transaksi");
        response.setData(totalDana);

        return response;

    } catch (Exception e) {
        GeneralResponseDto<BigDecimal> response = new GeneralResponseDto<>();
        response.setResponseCode("500");
        response.setResponseDesc("Gagal menghitung total dana semua transaksi");
        return response;
    }
}

}
