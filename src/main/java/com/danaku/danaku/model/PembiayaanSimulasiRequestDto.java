package com.danaku.danaku.model;


import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class PembiayaanSimulasiRequestDto {

    private BigDecimal saldoAwal;   // pinjaman
    private Integer jangkaWaktu;    // bulan
    private BigDecimal bungaTahunan; // persen (10)
    private LocalDate tanggalMulai;

    // getter & setter
}
