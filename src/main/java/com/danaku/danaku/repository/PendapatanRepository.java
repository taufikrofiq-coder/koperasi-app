package com.danaku.danaku.repository;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.pendapatanEntity;
@Repository
public interface PendapatanRepository extends JpaRepository<pendapatanEntity, Long> {
 @Query(value = """
        SELECT
            COALESCE(SUM(CAST(credit AS NUMERIC)), 0)
            -
            COALESCE(SUM(CAST(debet AS NUMERIC)), 0)
        FROM pendapatan
    """, nativeQuery = true)
    BigDecimal getTotalPendapatan();
}
