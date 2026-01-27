package com.danaku.danaku.service;

import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.PembiayaanRequestDto;
import com.danaku.danaku.model.PembiayaanSimulasiRequestDto;

public interface PembiayaanService {

    GeneralResponseDto<?> createPembiayaan(PembiayaanRequestDto request);

    GeneralResponseDto<?> inquiryByNoPembiayaan(String noPembiayaan);
    GeneralResponseDto<?> simulasiPembiayaan(PembiayaanSimulasiRequestDto request);
     // ✅ GET ALL
    GeneralResponseDto<?> getAllPembiayaan();

    // ✅ GET BY NO REKENING
    GeneralResponseDto<?> getPembiayaanByNoRekening(String noRekening);

     GeneralResponseDto<?> inquiryNextAngsuran(String noPembiayaan);

}
