package com.danaku.danaku.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.service.PendapatanService;

@RestController
@RequestMapping("/api/pendapatan")
public class PendapatanController {

    private final PendapatanService pendapatanService;

    public PendapatanController(PendapatanService pendapatanService) {
        this.pendapatanService = pendapatanService;
    }

    @GetMapping("/total")
    public ResponseEntity<GeneralResponseDto<BigDecimal>> getTotalPendapatan() {
        return ResponseEntity.ok(
                pendapatanService.getTotalPendapatan()
        );
    }
}
