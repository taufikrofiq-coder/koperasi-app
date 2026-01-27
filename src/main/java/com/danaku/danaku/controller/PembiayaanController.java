package com.danaku.danaku.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.PembiayaanRequestDto;
import com.danaku.danaku.model.PembiayaanSimulasiRequestDto;
import com.danaku.danaku.service.PembiayaanService;

@RestController
@RequestMapping("/api/pembiayaan")
public class PembiayaanController {

    @Autowired
    private PembiayaanService pembiayaanService;

   @PostMapping("/create")
public ResponseEntity<GeneralResponseDto<?>> create(
        @RequestBody PembiayaanRequestDto request) {

    return ResponseEntity.ok(pembiayaanService.createPembiayaan(request));
}

 @GetMapping("/inquiry/{noPembiayaan}")
    public ResponseEntity<GeneralResponseDto<?>> inquiry(
            @PathVariable String noPembiayaan) {

        return ResponseEntity.ok(
                pembiayaanService.inquiryByNoPembiayaan(noPembiayaan)
        );
    }

    
        @GetMapping("/inquiry/angsuran/{noPembiayaan}")
     public ResponseEntity<?> inquiryNext(@PathVariable String noPembiayaan) {
        return ResponseEntity.ok(
                pembiayaanService.inquiryNextAngsuran(noPembiayaan)
        );
    }



    @PostMapping("/simulasi")
    public ResponseEntity<?> simulasi(@RequestBody PembiayaanSimulasiRequestDto request) {
        return ResponseEntity.ok(pembiayaanService.simulasiPembiayaan(request));
    }


 @GetMapping("/ViewAll")
    public ResponseEntity<GeneralResponseDto<?>> getAllPembiayaan() {
        return ResponseEntity.ok(
                pembiayaanService.getAllPembiayaan()
        );
    }

    @GetMapping("/rekening/{noRekening}")
    public ResponseEntity<GeneralResponseDto<?>> getByNoRekening(
            @PathVariable String noRekening) {

        return ResponseEntity.ok(
                pembiayaanService.getPembiayaanByNoRekening(noRekening)
        );
    }

}
