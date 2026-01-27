package com.danaku.danaku.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.pembiayaanEntity;

@Repository
public interface PembiayaanRepository extends JpaRepository<pembiayaanEntity, Long> {

    boolean existsByNoPembiayaan(String noPembiayaan);

    Optional<pembiayaanEntity> findTopByOrderByIdDesc();
     Optional<pembiayaanEntity> findByNoPembiayaan(String noPembiayaan);
      List<pembiayaanEntity> findByNoRekening(String noRekening);
      
}
