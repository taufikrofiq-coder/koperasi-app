package com.danaku.danaku.service;

import com.danaku.danaku.model.GeneralResponseDto;

public interface PembayaranAngsuranService {
    GeneralResponseDto<?> bayarAngsuran(Long pembiayaanDetailId);
}


