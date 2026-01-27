package com.danaku.danaku.repository;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.transaksiEntity;

@Repository
public interface transaksiRepository extends JpaRepository<transaksiEntity, Long> {

    List<transaksiEntity> findByNoRekening(String noRekening);


     @Query("SELECT t FROM transaksiEntity t WHERE t.noRekening = :noRekening AND t.tanggal >= :sixMonthsAgo ORDER BY t.tanggal DESC")
    List<transaksiEntity> findByNoRekeningAndTanggalAfter(
        @Param("noRekening") String noRekening,
        @Param("sixMonthsAgo") LocalDateTime sixMonthsAgo);


@Query(
  value = """
      SELECT
        COALESCE(SUM(CAST(NULLIF(credit, '') AS DECIMAL)), 0)
        -
        COALESCE(SUM(CAST(NULLIF(debet, '') AS DECIMAL)), 0)
      FROM transaksi
      WHERE no_rekening = :noRekening
      """,
  nativeQuery = true
)
BigDecimal getTotalDanaByNoRekening(String noRekening);


@Query(
  value = """
      SELECT
        COALESCE(SUM(CAST(NULLIF(credit, '') AS DECIMAL)), 0)
        -
        COALESCE(SUM(CAST(NULLIF(debet, '') AS DECIMAL)), 0)
      FROM transaksi
      """,
  nativeQuery = true
)
BigDecimal getTotalDanaAll();

   @Query("""
SELECT COALESCE(SUM(CAST(t.credit AS big_decimal)), 0)
FROM transaksiEntity t
WHERE t.noRekening = :noRekening
""")
String totalCreditByNoRekening(@Param("noRekening") String noRekening);

@Query("""
SELECT COALESCE(SUM(CAST(t.debet AS big_decimal)), 0)
FROM transaksiEntity t
WHERE t.noRekening = :noRekening
""")
String totalDebetByNoRekening(@Param("noRekening") String noRekening);

}

