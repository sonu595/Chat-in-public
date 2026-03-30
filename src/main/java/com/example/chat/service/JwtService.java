package com.example.chat.service;

import java.util.Date;

import org.springframework.stereotype.Service;

import com.example.chat.entity.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {
    private final String SECRET = "mysecreolwberljwbljbg";

    public String generateToken(User user){
        return Jwts.builder()
        .setSubject(user.getEmail())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000))
        .signWith(SignatureAlgorithm.HS256, SECRET)
        .compact();
    }

    public String extractEmail(String token){
        return Jwts.parser()
        .setSigningKey(SECRET)
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
    }
}
