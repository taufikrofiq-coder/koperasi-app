package com.danaku.danaku.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.entity.transaksiEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.TransaksiRequestDto;
import com.danaku.danaku.service.transaksiService;

@RestController
@RequestMapping("/api/transaksi")
@CrossOrigin(origins = "*")
public class transaksiController {

    private final transaksiService transaksiService;

    public transaksiController(transaksiService transaksiService) {
        this.transaksiService = transaksiService;
    }

    // ✅ CREATE
    @PostMapping("/create")
    public ResponseEntity<GeneralResponseDto<String>> create(
            @RequestBody TransaksiRequestDto request) {

        GeneralResponseDto<String> response = transaksiService.createTransaksi(request);
        return mapResponse(response);
    }

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<GeneralResponseDto<List<transaksiEntity>>> getAll() {
        GeneralResponseDto<List<transaksiEntity>> response = transaksiService.getAllTransaksi();
        return mapResponse(response);
    }

    // ✅ GET BY NO REKENING
    @CrossOrigin(origins = "*")
    @GetMapping("/rekening/{noRekening}")
    public ResponseEntity<GeneralResponseDto<List<transaksiEntity>>> getByNoRekening(
            @PathVariable("noRekening") String noRekening) {

        GeneralResponseDto<List<transaksiEntity>> response =
                transaksiService.getTransaksiByNoRekening(noRekening);
        return mapResponse(response);
    }

    // ===== HELPER =====
    private <T> ResponseEntity<GeneralResponseDto<T>> mapResponse(GeneralResponseDto<T> response) {
        return switch (response.getResponseCode()) {
            case "200" -> ResponseEntity.ok(response);
            case "404" -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            default -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        };
    }

    @GetMapping("/saldo/{noRekening}")
    public ResponseEntity<GeneralResponseDto<BigDecimal>> getSaldo(
            @PathVariable("noRekening") String noRekening) {

        GeneralResponseDto<BigDecimal> response =
                transaksiService.getTotalDanaByNoRekening(noRekening);

        return ResponseEntity.ok(response);
    }

@GetMapping("/saldo")
public ResponseEntity<GeneralResponseDto<BigDecimal>> getSaldoAll() {

    GeneralResponseDto<BigDecimal> response =
            transaksiService.getTotalDanaAll();

    return ResponseEntity.ok(response);
}


}
