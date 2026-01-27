package com.danaku.danaku.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.danaku.danaku.entity.employeesEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.employeesRequestDto;
import com.danaku.danaku.repository.employeesRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class employeesService {

    private final employeesRepository employeesRepository;

    @Autowired
    public employeesService(employeesRepository employeesRepository) {
        this.employeesRepository = employeesRepository;
    }

    // --- CREATE ---
    public employeesEntity createEmployeeEntity(employeesRequestDto dto) throws Exception {
        log.info("▶️ Memulai proses pembuatan karyawan dengan nama: {}", dto.getNama());

        // Format: ddyymm + nomor urut 4 digit = total 10 digit
        // Contoh: 2412010001 (tanggal 1 Desember 2024, urut 0001)
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("ddyyMM"));
        log.debug("ℹ️ Format tanggal untuk no rekening: {}", datePart);

        // Cari no rekening terakhir dengan tanggal hari ini
        String lastNoRekening = employeesRepository.findMaxNoRekeningByDate(datePart);
        log.debug("ℹ️ No rekening terakhir untuk tanggal {}: {}", datePart, lastNoRekening);

        int nextSeq = 1;
        if (lastNoRekening != null && lastNoRekening.length() >= 10) {
            try {
                // Ambil 4 digit terakhir sebagai sequence
                String lastSeqStr = lastNoRekening.substring(6); // Ambil 4 digit terakhir
                nextSeq = Integer.parseInt(lastSeqStr) + 1;
                log.debug("ℹ️ Sequence berikutnya: {}", nextSeq);
            } catch (NumberFormatException nfe) {
                log.warn("⚠️ Tidak dapat parsing sequence '{}' — gunakan 1", lastNoRekening.substring(6));
            }
        }

        // Format: ddyymm (6 digit) + nomor urut 4 digit = 10 digit
        String noRekening = datePart + String.format("%04d", nextSeq);
        
        // Validasi panjang (harus 10 digit)
        if (noRekening.length() != 10) {
            throw new Exception("Generated no rekening tidak valid: " + noRekening);
        }
        
        log.info("✅ Generated No Rekening baru: {}", noRekening);

        employeesEntity employee = new employeesEntity();
        employee.setNoRekening(noRekening); // Set noRekening yang sudah digenerate
        employee.setNama(dto.getNama());
        employee.setNoTelp(dto.getNoTelp());
        employee.setAlamat(dto.getAlamat());
        employee.setRole(dto.getRole());
        employee.setTanggal(LocalDateTime.now());

        try {
            return employeesRepository.saveAndFlush(employee);
        } catch (DataIntegrityViolationException dive) {
            throw new Exception("Constraint violation: " + dive.getMessage(), dive);
        }
    }

    public GeneralResponseDto<employeesEntity> createEmployee(employeesRequestDto dto) {
        GeneralResponseDto<employeesEntity> resp = new GeneralResponseDto<>();
        try {
            employeesEntity saved = createEmployeeEntity(dto);
            resp.setResponseCode("200");
            resp.setResponseDesc("Sukses menambahkan employee");
            resp.setData(saved);
        } catch (Exception e) {
            log.error("❌ Gagal membuat employee", e);
            resp.setResponseCode("500");
            resp.setResponseDesc("Gagal menambahkan employee: " + e.getMessage());
        }
        return resp;
    }

    // --- READ ---
    public GeneralResponseDto<employeesEntity> getEmployeeByNoRekening(String noRekening) {
        GeneralResponseDto<employeesEntity> response = new GeneralResponseDto<>();
        try {
            Optional<employeesEntity> employeeOpt = employeesRepository.findByNoRekening(noRekening);
            if (employeeOpt.isPresent()) {
                response.setResponseCode("200");
                response.setResponseDesc("Sukses mendapatkan data karyawan");
                response.setData(employeeOpt.get());
            } else {
                response.setResponseCode("404");
                response.setResponseDesc("Karyawan tidak ditemukan");
            }
        } catch (Exception e) {
            response.setResponseCode("500");
            response.setResponseDesc("Error: " + e.getMessage());
        }
        return response;
    }

    // --- UPDATE ---
    public GeneralResponseDto<employeesEntity> updateEmployee(String noRekening, employeesRequestDto dto) {
        GeneralResponseDto<employeesEntity> response = new GeneralResponseDto<>();
        try {
            Optional<employeesEntity> employeeOpt = employeesRepository.findByNoRekening(noRekening);
            if (employeeOpt.isPresent()) {
                employeesEntity employee = employeeOpt.get();
                employee.setNama(dto.getNama());
                employee.setNoTelp(dto.getNoTelp());
                employee.setAlamat(dto.getAlamat());
                employee.setRole(dto.getRole());
                employeesEntity updated = employeesRepository.save(employee);

                response.setResponseCode("00");
                response.setResponseDesc("Sukses memperbarui data karyawan");
                response.setData(updated);
            } else {
                response.setResponseCode("404");
                response.setResponseDesc("Karyawan tidak ditemukan");
            }
        } catch (Exception e) {
            response.setResponseCode("500");
            response.setResponseDesc("Error: " + e.getMessage());
        }
        return response;
    }

    // --- DELETE ---
    public GeneralResponseDto<Void> deleteEmployee(String noRekening) {
        GeneralResponseDto<Void> response = new GeneralResponseDto<>();
        try {
            Optional<employeesEntity> employeeOpt = employeesRepository.findByNoRekening(noRekening);
            if (employeeOpt.isPresent()) {
                employeesRepository.delete(employeeOpt.get());
                response.setResponseCode("200");
                response.setResponseDesc("Sukses menghapus karyawan");
            } else {
                response.setResponseCode("404");
                response.setResponseDesc("Karyawan tidak ditemukan");
            }
        } catch (Exception e) {
            response.setResponseCode("500");
            response.setResponseDesc("Error: " + e.getMessage());
        }
        return response;
    }

    public List<employeesEntity> getAllEmployees() {
        return employeesRepository.findAll();
    }
}