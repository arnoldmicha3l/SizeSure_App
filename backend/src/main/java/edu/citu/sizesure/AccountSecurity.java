package edu.citu.sizesure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
class AccountSecurity {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder(12);}
 @Bean SecurityContextRepository contextRepository(){return new HttpSessionSecurityContextRepository();}
 @Bean SecurityFilterChain securityFilterChain(HttpSecurity http,SecurityContextRepository repository) throws Exception {
  http.securityContext(c->c.securityContextRepository(repository))
          .csrf(c -> c
                  .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                  .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
          )
   .authorizeHttpRequests(a->a
    .requestMatchers(HttpMethod.GET,"/api/v1/health","/api/v1/auth/csrf").permitAll()
    .requestMatchers(HttpMethod.POST,"/api/v1/auth/register","/api/v1/auth/login").permitAll()
    .requestMatchers("/api/v1/**").authenticated()
    .anyRequest().permitAll())
   .formLogin(f->f.disable()).httpBasic(b->b.disable());
  return http.build();
 }
}
