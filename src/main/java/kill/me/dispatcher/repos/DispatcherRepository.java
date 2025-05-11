package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Dispatcher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DispatcherRepository extends JpaRepository<Dispatcher, Long> {
    Optional<Dispatcher> findByUsername(String username);

    Dispatcher findDispatcherByUsername(String username);
    Dispatcher getById(Long id);
}
