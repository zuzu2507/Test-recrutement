package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Taches de l'utilisateur connecte, avec filtre optionnel par statut
     * et recherche optionnelle sur le titre ou la description.
     */
    @Query("""
            SELECT t FROM Task t
            WHERE t.user.id = :userId
              AND (:status IS NULL OR t.status = :status)
              AND (:search IS NULL
                   OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY t.createdAt DESC
            """)
    List<Task> search(@Param("userId") Long userId,
                      @Param("status") TaskStatus status,
                      @Param("search") String search);

    Optional<Task> findByIdAndUserId(Long id, Long userId);
}
