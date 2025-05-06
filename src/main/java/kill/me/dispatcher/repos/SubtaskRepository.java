package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
}
