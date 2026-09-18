package com.taskmanager.entity;

/**
 * Cycle de vie d'une tache. La progression est a sens unique :
 * TODO -> IN_PROGRESS -> DONE. Un retour en arriere est refuse, un saut
 * vers l'avant reste possible (une tache peut etre terminee directement).
 */
public enum TaskStatus {

    TODO(0),
    IN_PROGRESS(1),
    DONE(2);

    private final int rank;

    TaskStatus(int rank) {
        this.rank = rank;
    }

    /** @return true si la transition vers {@code target} avance ou reste sur place. */
    public boolean canMoveTo(TaskStatus target) {
        return target.rank >= this.rank;
    }
}
