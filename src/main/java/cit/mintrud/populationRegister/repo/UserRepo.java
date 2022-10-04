package cit.mintrud.populationRegister.repo;

import cit.mintrud.populationRegister.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepo extends JpaRepository<User, Integer> {
    User findByUsername(String username);
    List<User> findAll();
}
