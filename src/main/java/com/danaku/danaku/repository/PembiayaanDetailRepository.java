package com.danaku.danaku.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.pembiayaanDetailEntity;

@Repository
public interface PembiayaanDetailRepository extends JpaRepository<pembiayaanDetailEntity, Long> {

    List<pembiayaanDetailEntity> findByNoPembiayaan(String noPembiayaan);
    List<pembiayaanDetailEntity> findByNoPembiayaanOrderByTanggalJatuhTempoAsc(String noPembiayaan);

     @Query("""
    SELECT p
    FROM pembiayaanDetailEntity p
    WHERE p.noPembiayaan = :noPembiayaan
      AND p.status = 'BELUM BAYAR'
    ORDER BY p.tanggalJatuhTempo ASC
""")
List<pembiayaanDetailEntity> findNextUnpaidByNoPembiayaan(
        @Param("noPembiayaan") String noPembiayaan,
        Pageable pageable
);

 boolean existsByNoPembiayaanAndStatusIgnoreCase(String noPembiayaan, String status);

 @Query("""
        SELECT COALESCE(SUM(CAST(p.pokok AS double)), 0)
        FROM pembiayaanDetailEntity p
        WHERE LOWER(p.status) = LOWER(:status)
    """)
    Double totalPokokByStatus(@Param("status") String status);
}
