package com.danaku.danaku.entity;

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
@Table(name = "pendapatan")
public class pendapatanEntity {
      @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
    private String noPembiayaan;
    private String credit;
    private String debet;
    private String keterangan;
    private LocalDateTime tanggal;
}
