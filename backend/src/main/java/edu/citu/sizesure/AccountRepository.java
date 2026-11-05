package edu.citu.sizesure;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
interface AccountRepository extends JpaRepository<Account,String> {
 Optional<Account> findByEmail(String email);
 boolean existsByEmail(String email);
}
