package com.danaku.danaku.service;

import java.math.BigDecimal;

import com.danaku.danaku.model.GeneralResponseDto;

public interface PendapatanService {
    GeneralResponseDto<BigDecimal> getTotalPendapatan();
}
