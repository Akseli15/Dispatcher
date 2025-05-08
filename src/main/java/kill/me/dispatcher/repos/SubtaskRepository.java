package kill.me.dispatcher.repos;

import kill.me.dispatcher.entities.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubtaskRepository extends JpaRepository<Subtask, Long> {

    List<Subtask> findAllByTaskId(Long taskId);
}
