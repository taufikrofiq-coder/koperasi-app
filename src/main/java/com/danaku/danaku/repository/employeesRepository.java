package com.danaku.danaku.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.employeesEntity;

@Repository
public interface employeesRepository extends JpaRepository<employeesEntity, String> { // Ubah ID menjadi String

    List<employeesEntity> findAllByNoRekening(String noRekening);

    int countByTanggalBetween(LocalDateTime start, LocalDateTime end);

    @Query(value = "SELECT e.no_rekening FROM employees e " +
                "WHERE SUBSTRING(e.no_rekening, 1, 6) = :datePart " +
                "ORDER BY e.no_rekening DESC LIMIT 1",
        nativeQuery = true)
    String findMaxNoRekeningByDate(@Param("datePart") String datePart);
    
    // Method untuk mencari berdasarkan noRekening
    Optional<employeesEntity> findByNoRekening(String noRekening);
}