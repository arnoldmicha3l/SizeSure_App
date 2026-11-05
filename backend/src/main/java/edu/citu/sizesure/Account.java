package edu.citu.sizesure;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="app_accounts")
class Account {
 @Id public String id = UUID.randomUUID().toString();
 @Column(nullable=false,unique=true,length=254) public String email;
 @Column(name="display_name",nullable=false,length=120) public String displayName;
 @Column(name="password_hash",nullable=false,length=100) public String passwordHash;
 @Column(name="account_role",nullable=false,length=12) public String accountRole;
 @Column(name="created_at",nullable=false) public Instant createdAt=Instant.now();
}
