package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task,Long> {
}
