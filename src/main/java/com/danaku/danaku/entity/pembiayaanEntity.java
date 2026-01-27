package com.danaku.danaku.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "pembiayaan")
public class pembiayaanEntity {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
    private String nama;
    private String noRekening;
    private String noPembiayaan;
    private String jangkaWaktu;
    private String bagiHasil;
    private String status;
    private LocalDate tanggalAwalPembiayaan;
    private LocalDate tanggalAkhirPembiayaan;
    private LocalDateTime tanggal;
}
