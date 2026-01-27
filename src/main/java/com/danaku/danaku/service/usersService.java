package com.danaku.danaku.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.danaku.danaku.entity.employeesEntity;
import com.danaku.danaku.entity.usersEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.UserResponseDto;
import com.danaku.danaku.model.employeesRequestDto;
import com.danaku.danaku.model.userRequestDto;
import com.danaku.danaku.repository.employeesRepository;
import com.danaku.danaku.repository.usersRepository;

@Service
public class usersService {

    private static final Logger logger = LoggerFactory.getLogger(usersService.class);

    private final usersRepository usersRepository;
    private final employeesRepository employeesRepository;
    private final employeesService employeesService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public usersService(usersRepository usersRepository,
                        employeesRepository employeesRepository,
                        employeesService employeesService,
                        BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.usersRepository = usersRepository;
        this.employeesRepository = employeesRepository;
        this.employeesService = employeesService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    // ✅ CREATE USER
    @Transactional
    public GeneralResponseDto<String> createUser(userRequestDto userRequestDto) {
        logger.info("Memulai proses pembuatan user dan karyawan dengan username: {}", userRequestDto.getUserName());

        // CEK USERNAME SEBELUM MASUK KE HANDLEOPERATION
        if (usersRepository.existsByUserName(userRequestDto.getUserName())) {
            logger.warn("Username '{}' sudah terdaftar!", userRequestDto.getUserName());
            
            GeneralResponseDto<String> response = new GeneralResponseDto<>();
            response.setResponseCode("409");
            response.setResponseDesc("Username '" + userRequestDto.getUserName() + "' sudah terdaftar. Silakan gunakan username lain.");
            return response;
        }

        return handleOperation(() -> {
            // Buat employee baru
            employeesRequestDto empDto = new employeesRequestDto();
            empDto.setNama(userRequestDto.getNama());
            empDto.setNoTelp(userRequestDto.getNoTelp());
            empDto.setAlamat(userRequestDto.getAlamat());
            empDto.setRole(userRequestDto.getRole());

            GeneralResponseDto<employeesEntity> employeeResp = employeesService.createEmployee(empDto);

            employeesEntity savedEmployee = employeeResp.getData();
            if (savedEmployee == null) {
                GeneralResponseDto<String> errorResponse = new GeneralResponseDto<>();
                errorResponse.setResponseCode("400");
                errorResponse.setResponseDesc("Gagal menyimpan employee");
                return errorResponse;
            }

            // Simpan user dengan noRekening dari employee yang baru dibuat
            usersEntity user = new usersEntity();
            user.setUserName(userRequestDto.getUserName());
            user.setPassword(bCryptPasswordEncoder.encode(userRequestDto.getPassword()));
            user.setNoRekening(savedEmployee.getNoRekening());
            user.setTanggal(LocalDateTime.now());

            usersRepository.save(user);
            logger.info("Berhasil menambahkan user: {} dengan noRekening: {}", user.getUserName(), user.getNoRekening());

            return createSuccessResponse("Sukses menambahkan user dan karyawan");
        }, "Gagal menambahkan user dan karyawan");
    }

    // ✅ GET USER BY ID
    public GeneralResponseDto<UserResponseDto> getUserById(Long userId) {
        logger.info("Memulai proses pengambilan data user dengan ID: {}", userId);

        return handleOperation(() -> {
            usersEntity user = usersRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

            logger.info("User ditemukan: {}", user.getUserName());

            String noRekening = user.getNoRekening();
            Optional<employeesEntity> empOpt = employeesRepository.findByNoRekening(noRekening);

            UserResponseDto dto = new UserResponseDto();
            dto.setUserId(user.getUserId());
            dto.setUserName(user.getUserName());

            empOpt.ifPresent(emp -> {
                dto.setNama(emp.getNama());
                dto.setNoTelp(emp.getNoTelp());
                dto.setRole(emp.getRole());
                dto.setNoRekening(emp.getNoRekening());
            });

            GeneralResponseDto<UserResponseDto> response = new GeneralResponseDto<>();
            response.setResponseCode("200");
            response.setResponseDesc("Sukses mendapatkan data user & employee");
            response.setData(dto);

            return response;
        }, "Gagal mendapatkan data user");
    }

    // ✅ UPDATE USER + EMPLOYEE
    @Transactional
    public GeneralResponseDto<String> updateUser(String noRekening, userRequestDto req) {
        logger.info("Memulai proses update user dengan noRekening: {}", noRekening);

        return handleOperation(() -> {
            // Cek apakah user ada
            usersEntity user = usersRepository.findByNoRekening(noRekening)
                    .orElseThrow(() -> new IllegalArgumentException("User dengan noRekening " + noRekening + " tidak ditemukan"));

            // Cek apakah employee ada
            employeesEntity emp = employeesRepository.findByNoRekening(noRekening)
                    .orElseThrow(() -> new IllegalArgumentException("Employee dengan noRekening " + noRekening + " tidak ditemukan"));

            // Update data karyawan
            emp.setNama(req.getNama());
            emp.setNoTelp(req.getNoTelp());
            emp.setAlamat(req.getAlamat());
            emp.setRole(req.getRole());
            employeesRepository.save(emp);

            // Update data user
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                user.setPassword(bCryptPasswordEncoder.encode(req.getPassword()));
            }
            user.setTanggal(LocalDateTime.now());
            usersRepository.save(user);

            logger.info("Berhasil update user {} dan employee dengan noRekening {}", user.getUserName(), noRekening);

            return createSuccessResponse("Sukses update user dan karyawan");
        }, "Gagal update user dan karyawan");
    }

    // ✅ GET USER BY noRekening
    public GeneralResponseDto<UserResponseDto> getUserByNoRekening(String noRekening) {
        logger.info("Memulai proses pengambilan data user dengan noRekening: {}", noRekening);

        return handleOperation(() -> {
            usersEntity user = usersRepository.findByNoRekening(noRekening)
                    .orElseThrow(() -> new IllegalArgumentException("User dengan noRekening " + noRekening + " tidak ditemukan"));

            employeesEntity emp = employeesRepository.findByNoRekening(noRekening)
                    .orElseThrow(() -> new IllegalArgumentException("Employee dengan noRekening " + noRekening + " tidak ditemukan"));

            UserResponseDto dto = new UserResponseDto();
            dto.setUserId(user.getUserId());
            dto.setUserName(user.getUserName());
            dto.setNoRekening(user.getNoRekening());
            dto.setNama(emp.getNama());
            dto.setNoTelp(emp.getNoTelp());
            dto.setRole(emp.getRole());

            GeneralResponseDto<UserResponseDto> response = new GeneralResponseDto<>();
            response.setResponseCode("200");
            response.setResponseDesc("Sukses mendapatkan data user berdasarkan noRekening");
            response.setData(dto);

            return response;
        }, "Gagal mendapatkan data user berdasarkan noRekening");
    }

    // ✅ DELETE USER
    @Transactional
    public GeneralResponseDto<String> deleteUser(Long userId) {
        logger.info("Memulai proses penghapusan user dengan ID: {}", userId);
        return handleOperation(() -> {
            usersRepository.deleteById(userId);
            logger.info("Berhasil menghapus user dengan ID: {}", userId);
            return createSuccessResponse("Sukses menghapus user");
        }, "Gagal menghapus user");
    }

    // ✅ GET ALL USERS
    public GeneralResponseDto<List<UserResponseDto>> getAllUsers() {
        logger.info("Mengambil semua data user dari database");
        
        return handleOperation(() -> {
            List<usersEntity> users = usersRepository.findAll();
            logger.info("Jumlah user ditemukan: {}", users.size());
            
            List<UserResponseDto> userDtos = users.stream().map(user -> {
                UserResponseDto dto = new UserResponseDto();
                dto.setUserId(user.getUserId());
                dto.setUserName(user.getUserName());
                dto.setNoRekening(user.getNoRekening());
                
                employeesRepository.findByNoRekening(user.getNoRekening()).ifPresent(emp -> {
                    dto.setNama(emp.getNama());
                    dto.setNoTelp(emp.getNoTelp());
                    dto.setRole(emp.getRole());
                });
                
                return dto;
            }).toList();
            
            GeneralResponseDto<List<UserResponseDto>> response = new GeneralResponseDto<>();
            response.setResponseCode("200");
            response.setResponseDesc("Sukses mendapatkan semua data user");
            response.setData(userDtos);
            
            return response;
        }, "Gagal mendapatkan data user");
    }

    // ✅ CEK KETERSEDIAAN USERNAME
    public GeneralResponseDto<Boolean> checkUsernameAvailability(String username) {
        logger.info("Memeriksa ketersediaan username: {}", username);
        
        GeneralResponseDto<Boolean> response = new GeneralResponseDto<>();
        try {
            boolean exists = usersRepository.existsByUserName(username);
            response.setResponseCode("200");
            response.setResponseDesc(exists ? "Username sudah digunakan" : "Username tersedia");
            response.setData(!exists);
        } catch (Exception e) {
            logger.error("Error checking username availability: {}", e.getMessage());
            response.setResponseCode("500");
            response.setResponseDesc("Error checking username");
            response.setData(false);
        }
        return response;
    }

    // ✅ GENERIC HANDLE OPERATION
    private <T> GeneralResponseDto<T> handleOperation(Operation<T> operation, String errorMessage) {
        try {
            return operation.run();
        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            GeneralResponseDto<T> response = new GeneralResponseDto<>();
            response.setResponseCode("400");
            response.setResponseDesc(e.getMessage());
            return response;
        } catch (DataIntegrityViolationException e) {
            logger.error("Data integrity violation: {}", e.getMessage());
            GeneralResponseDto<T> response = new GeneralResponseDto<>();
            response.setResponseCode("409");
            response.setResponseDesc("Data konflik: " + e.getMostSpecificCause().getMessage());
            return response;
        } catch (EmptyResultDataAccessException e) {
            logger.error("Data not found: {}", e.getMessage());
            GeneralResponseDto<T> response = new GeneralResponseDto<>();
            response.setResponseCode("404");
            response.setResponseDesc("Data tidak ditemukan");
            return response;
        } catch (IllegalStateException e) {
            logger.error("Illegal state: {}", e.getMessage());
            GeneralResponseDto<T> response = new GeneralResponseDto<>();
            response.setResponseCode("400");
            response.setResponseDesc(e.getMessage());
            return response;
        } catch (Exception e) {
            logger.error("Terjadi error saat operasi: {}", e.getMessage(), e);
            GeneralResponseDto<T> response = new GeneralResponseDto<>();
            response.setResponseCode("500");
            response.setResponseDesc(errorMessage + ": " + e.getMessage());
            return response;
        }
    }

    private GeneralResponseDto<String> createSuccessResponse(String message) {
        GeneralResponseDto<String> response = new GeneralResponseDto<>();
        response.setResponseCode("200");
        response.setResponseDesc(message);
        return response;
    }

    @FunctionalInterface
    private interface Operation<T> {
        GeneralResponseDto<T> run() throws Exception;
    }
}