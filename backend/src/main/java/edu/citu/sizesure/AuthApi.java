package edu.citu.sizesure;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/v1/auth")
class AuthApi {
 private final AccountRepository accounts;
 private final PasswordEncoder encoder;
 private final SecurityContextRepository contexts;
 AuthApi(AccountRepository accounts,PasswordEncoder encoder,SecurityContextRepository contexts){this.accounts=accounts;this.encoder=encoder;this.contexts=contexts;}
 record Register(@NotBlank @Size(max=120) String displayName,@NotBlank @Email String email,@NotBlank @Size(min=12,max=128) String password,@NotBlank String role){}
 record Login(@NotBlank String email,@NotBlank String password){}
 record PublicAccount(String id,String displayName,String email,String role){}
 private PublicAccount publicAccount(Account a){return new PublicAccount(a.id,a.displayName,a.email,a.accountRole);}
 private String normalized(String email){return email.trim().toLowerCase(Locale.ROOT);}
 private void establish(Account account,HttpServletRequest request,HttpServletResponse response){
  HttpSession session=request.getSession(true); request.changeSessionId();
  SecurityContext context=SecurityContextHolder.createEmptyContext();
  context.setAuthentication(new UsernamePasswordAuthenticationToken(account.id,null,List.of(new SimpleGrantedAuthority("ROLE_"+account.accountRole))));
  SecurityContextHolder.setContext(context);contexts.saveContext(context,request,response);
 }
 @GetMapping("/csrf") Map<String,String> csrf(CsrfToken token){return Map.of("headerName",token.getHeaderName(),"token",token.getToken());}
 @PostMapping("/register") synchronized ResponseEntity<PublicAccount> register(@Valid @RequestBody Register r,HttpServletRequest request,HttpServletResponse response){
  if(!Set.of("BUYER","SELLER").contains(r.role()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose buyer or seller");
  String email=normalized(r.email());
  if(accounts.existsByEmail(email))throw new ResponseStatusException(HttpStatus.CONFLICT,"Email is already registered");
  Account a=new Account();a.email=email;a.displayName=r.displayName().trim();a.accountRole=r.role();a.passwordHash=encoder.encode(r.password());
  accounts.save(a);establish(a,request,response);return ResponseEntity.status(HttpStatus.CREATED).body(publicAccount(a));
 }
 @PostMapping("/login") PublicAccount login(@Valid @RequestBody Login r,HttpServletRequest request,HttpServletResponse response){
  Account a=accounts.findByEmail(normalized(r.email())).orElse(null);
  if(a==null||!encoder.matches(r.password(),a.passwordHash))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password");
  establish(a,request,response);return publicAccount(a);
 }
 @GetMapping("/me") PublicAccount me(org.springframework.security.core.Authentication auth){
  return accounts.findById(auth.getName()).map(this::publicAccount).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
 }
 @PostMapping("/logout") ResponseEntity<Void> logout(HttpServletRequest request){
  HttpSession session=request.getSession(false);if(session!=null)session.invalidate();SecurityContextHolder.clearContext();return ResponseEntity.noContent().build();
 }
}
