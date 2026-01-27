package com.danaku.danaku.service;


import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.danaku.danaku.entity.employeesEntity;
import com.danaku.danaku.entity.usersEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.UserResponseDto;
import com.danaku.danaku.repository.employeesRepository;
import com.danaku.danaku.repository.usersRepository;

@Service
public class UserEmployeeService {

    private final usersRepository usersRepository;
    private final employeesRepository employeesRepository;

    public UserEmployeeService(usersRepository usersRepository, employeesRepository employeesRepository) {
        this.usersRepository = usersRepository;
        this.employeesRepository = employeesRepository;
    }

    public GeneralResponseDto<List<UserResponseDto>> getAllUsers() {
        List<usersEntity> users = usersRepository.findAll();
        List<UserResponseDto> userDtos = new ArrayList<>();

        for (usersEntity user : users) {
            String empId = user.getNoRekening();

            // repository method yang mengembalikan List (menghindari NonUniqueResultException)
            List<employeesEntity> empList = employeesRepository.findAllByNoRekening(empId);

            UserResponseDto dto = new UserResponseDto();
            dto.setUserId(user.getUserId());
            dto.setUserName(user.getUserName());

            if (!empList.isEmpty()) {
                // ambil entry pertama (atau sesuaikan logika jika ingin memilih lain)
                employeesEntity emp = empList.get(0);
                dto.setNama(emp.getNama());
                dto.setNoTelp(emp.getNoTelp());
                dto.setRole(emp.getRole());
                dto.setNoRekening(emp.getNoRekening());
            } else {
                // kalau tidak ditemukan employee, tetap masukkan user dengan field employee null
                dto.setNama(null);
                dto.setNoTelp(null);
                dto.setRole(null);
                dto.setNoRekening(null);
            }

            userDtos.add(dto);
        }

        GeneralResponseDto<List<UserResponseDto>> response = new GeneralResponseDto<>();
        response.setResponseCode("00");
        response.setResponseDesc("Success");
        response.setData(userDtos); // isi data hasil
        // optional: response.setTransactionDetail(userDtos);

        return response;
    }
}
