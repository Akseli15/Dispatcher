package kill.me.dispatcher.init;

import kill.me.dispatcher.entities.Dispatcher;
import kill.me.dispatcher.repos.DispatcherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    private final DispatcherRepository dispatcherRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(DispatcherRepository dispatcherRepository, PasswordEncoder passwordEncoder) {
        this.dispatcherRepository = dispatcherRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initAdmin() {
        return args -> {
            if (dispatcherRepository.findByUsername("admin").isEmpty()) {
                Dispatcher admin = new Dispatcher();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("Администратор");
                admin.setRole("ADMIN");
                dispatcherRepository.save(admin);
                System.out.println("Admin user created.");
            }
        };
    }
}
