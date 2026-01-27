package com.danaku.danaku.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.danaku.danaku.repository.PembiayaanDetailRepository;

@Service
@Transactional(readOnly = true)
public class PembiayaanDetailServiceImpl implements PembiayaanDetailService {

    private static final Logger logger =
            LoggerFactory.getLogger(PembiayaanDetailServiceImpl.class);

    @Autowired
    private PembiayaanDetailRepository pembiayaanDetailRepository;

    @Override
    public Double totalPokokBelumBayar() {

        logger.info("========== HITUNG TOTAL POKOK BELUM BAYAR ==========");

        Double total = pembiayaanDetailRepository
                .totalPokokByStatus("BELUM BAYAR");

        logger.info("✅ Total pokok BELUM BAYAR: {}", total);

        return total;
    }
}
