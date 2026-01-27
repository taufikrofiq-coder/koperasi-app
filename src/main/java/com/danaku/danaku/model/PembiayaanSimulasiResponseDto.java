package com.danaku.danaku.model;


import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class PembiayaanSimulasiResponseDto {

    private BigDecimal cicilanBulanan;
    private BigDecimal totalBunga;
    private BigDecimal totalPembayaran;
    private List<SimulasiCicilanDto> jadwal;

    // getter & setter
}
