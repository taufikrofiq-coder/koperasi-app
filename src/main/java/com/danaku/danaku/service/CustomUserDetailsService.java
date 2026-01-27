package com.danaku.danaku.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.danaku.danaku.entity.usersEntity;
import com.danaku.danaku.repository.usersRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private usersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        usersEntity user = usersRepository.findByUserName(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User tidak ditemukan: " + username));

        return User.builder()
                .username(user.getUserName())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
}
