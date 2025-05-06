package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.logs.TaskLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskLogRepository extends JpaRepository<TaskLog, Long> {
}
