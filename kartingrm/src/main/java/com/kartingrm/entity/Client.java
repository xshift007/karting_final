package com.kartingrm.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "clients")
@NoArgsConstructor
@AllArgsConstructor
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="full_name", nullable=false)
    private String fullName;

    @Column(nullable=false, unique=true)
    private String email;

    private String phone;
    private LocalDate birthDate;

    //@Column(length = 255)
    //private String address;

    @Column(name="total_visits", nullable=false)
    private Integer totalVisits = 0;

    @Column(name="registration_date", nullable=false)
    private LocalDateTime registrationDate = LocalDateTime.now();
}
