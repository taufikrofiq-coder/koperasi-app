package com.danaku.danaku.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.danaku.danaku.entity.employeesEntity;
import com.danaku.danaku.model.GeneralResponseDto;
import com.danaku.danaku.model.UserResponseDto;
import com.danaku.danaku.model.employeesRequestDto;
import com.danaku.danaku.service.UserEmployeeService;
import com.danaku.danaku.service.employeesService;

import lombok.RequiredArgsConstructor;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("/employees")
public class employeesController {

    @Autowired
    private final employeesService employeesService;
    private final UserEmployeeService userEmployeeService;

    @PostMapping("/add")
    public ResponseEntity<GeneralResponseDto> createEmployee(@RequestBody employeesRequestDto employeesRequestDto) {
        GeneralResponseDto response = employeesService.createEmployee(employeesRequestDto);
        return new ResponseEntity<>(response, HttpStatus.valueOf(Integer.parseInt(response.getResponseCode().substring(0, 3))));
    }
    
    @GetMapping("/{noRekening}")
    public ResponseEntity<GeneralResponseDto> getNoRekening(@PathVariable String noRekening) {
    GeneralResponseDto response = employeesService.getEmployeeByNoRekening(noRekening);
    return new ResponseEntity<>(
            response,
            HttpStatus.valueOf(Integer.parseInt(response.getResponseCode().substring(0, 3)))
    );
}

@PutMapping("/{employeeId}")
public ResponseEntity<GeneralResponseDto> updateEmployee(
        @PathVariable String employeeId,
        @RequestBody employeesRequestDto employeeRequestDto) {
    GeneralResponseDto response = employeesService.updateEmployee(employeeId, employeeRequestDto);
    return new ResponseEntity<>(
            response,
            HttpStatus.valueOf(Integer.parseInt(response.getResponseCode().substring(0, 3)))
    );
}

@DeleteMapping("/{employeeId}")
public ResponseEntity<GeneralResponseDto> deleteEmployee(@PathVariable String employeeId) {
    GeneralResponseDto response = employeesService.deleteEmployee(employeeId);
    return new ResponseEntity<>(
            response,
            HttpStatus.valueOf(Integer.parseInt(response.getResponseCode().substring(0, 3)))
    );
}

@GetMapping
public ResponseEntity<List<employeesEntity>> getAllEmployees() {
    List<employeesEntity> employees = employeesService.getAllEmployees();
    return new ResponseEntity<>(employees, HttpStatus.OK);
}


 @GetMapping("/cek-all-data")
    public ResponseEntity<GeneralResponseDto<List<UserResponseDto>>> getAllUsers() {
        GeneralResponseDto<List<UserResponseDto>> response = userEmployeeService.getAllUsers();
        return ResponseEntity.ok(response);
    }
}