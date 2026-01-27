package com.danaku.danaku.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.danaku.danaku.entity.pembiayaanDetailEntity;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class PembiayaanRequestDto {

    private String no;
    private String nama;
    private String noRekening;
    private Integer jangkaWaktu; // dalam bulan
    private BigDecimal saldoAwal;
    private BigDecimal bunga;    // per bulan (contoh: 1%)
    private pembiayaanDetailEntity nextAngsuran;
    private LocalDate tanggalAwalPembiayaan;
    private String status;
}
