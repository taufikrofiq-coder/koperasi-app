package com.danaku.danaku.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.repository.PendapatanRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PendapatanServiceImpl implements PendapatanService {

    private static final Logger log =
            LoggerFactory.getLogger(PendapatanServiceImpl.class);

    private final PendapatanRepository pendapatanRepository;

    public PendapatanServiceImpl(PendapatanRepository pendapatanRepository) {
        this.pendapatanRepository = pendapatanRepository;
    }

    @Override
    public GeneralResponseDto<BigDecimal> getTotalPendapatan() {

        log.info("========== MULAI PROSES GET TOTAL PENDAPATAN ==========");
        log.info("Waktu proses: {}", LocalDateTime.now());

        try {
            log.debug("Memanggil repository getTotalPendapatan()");

            BigDecimal total = pendapatanRepository.getTotalPendapatan();

            log.info("Berhasil mendapatkan total pendapatan");
            log.info("Total pendapatan: {}", total);

            log.info("========== PROSES GET TOTAL PENDAPATAN SELESAI ==========");

            return new GeneralResponseDto<>(
                    "00",
                    "Success",
                    total
            );

        } catch (Exception e) {
            log.error("Terjadi error saat mengambil total pendapatan");
            log.error("Error message: {}", e.getMessage());
            log.error("Stack trace:", e);

            log.info("========== PROSES GET TOTAL PENDAPATAN GAGAL ==========");

            return new GeneralResponseDto<>(
                    "99",
                    "Gagal mendapatkan total pendapatan",
                    BigDecimal.ZERO
            );
        }
    }
}
