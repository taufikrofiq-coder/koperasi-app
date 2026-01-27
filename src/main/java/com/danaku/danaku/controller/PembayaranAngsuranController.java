package com.danaku.danaku.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.service.PembayaranAngsuranService;

@RestController
@RequestMapping("/api/pembayaran")
public class PembayaranAngsuranController {

    @Autowired
    private PembayaranAngsuranService pembayaranAngsuranService;

    @PutMapping("/angsuran/{detailId}")
    public ResponseEntity<?> bayarAngsuran(
            @PathVariable Long detailId
    ) {
        return ResponseEntity.ok(
                pembayaranAngsuranService.bayarAngsuran(detailId)
        );
    }
}
