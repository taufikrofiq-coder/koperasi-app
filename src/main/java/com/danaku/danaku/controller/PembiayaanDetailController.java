package com.danaku.danaku.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.service.PembiayaanDetailService;

@RestController
@RequestMapping("/api/pembiayaan-detail")
public class PembiayaanDetailController {

    @Autowired
    private PembiayaanDetailService pembiayaanDetailService;

    @GetMapping("/total-pokok-belum-bayar")
    public ResponseEntity<?> totalPokokBelumBayar() {

        Double total = pembiayaanDetailService.totalPokokBelumBayar();

        return ResponseEntity.ok(
                new GeneralResponseDto<>(
                        "200",
                        "Total pokok dengan status BELUM BAYAR",
                        total
                )
        );
    }
}
