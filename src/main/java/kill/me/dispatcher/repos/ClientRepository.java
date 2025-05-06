package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
