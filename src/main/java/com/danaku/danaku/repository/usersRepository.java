package com.danaku.danaku.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.danaku.danaku.entity.usersEntity;

@Repository
public interface usersRepository extends JpaRepository<usersEntity, Long> {
    // Perhatikan: Generic type Long sesuai dengan userId tipe Long
    boolean existsByUserName(String userName);
    Optional<usersEntity> findByNoRekening(String noRekening);
    Optional<usersEntity> findByUserName(String userName);
}