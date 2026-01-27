package com.danaku.danaku.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.usersEntity;

@Repository
public interface usersRepository extends JpaRepository<usersEntity, Long> {
    boolean existsByUserName(String userName);
    Optional<usersEntity> findByNoRekening(String noRekening); // Pastikan ada method ini
    Optional<usersEntity> findByUserName(String userName); // Optional: jika diperlukan
}
     
