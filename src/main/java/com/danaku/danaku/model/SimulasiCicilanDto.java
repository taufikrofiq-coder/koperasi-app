package com.danaku.danaku.model;


import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class SimulasiCicilanDto {

    private Integer bulanKe;
    private LocalDate tanggalJatuhTempo;
    private BigDecimal saldoAwal;
    private BigDecimal pokok;
    private BigDecimal bunga;
    private BigDecimal cicilan;

    // getter & setter
}
