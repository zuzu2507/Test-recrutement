/// Cycle de vie d'une tache, miroir de l'enum TaskStatus du backend.
/// La progression est a sens unique : TODO -> IN_PROGRESS -> DONE.
enum TaskStatus {
  todo('TODO', 'A faire', 0),
  inProgress('IN_PROGRESS', 'En cours', 1),
  done('DONE', 'Termine', 2);

  const TaskStatus(this.wire, this.label, this.rank);

  /// Valeur echangee avec l'API.
  final String wire;
  final String label;
  final int rank;

  static TaskStatus fromWire(String value) =>
      TaskStatus.values.firstWhere((s) => s.wire == value, orElse: () => TaskStatus.todo);

  /// true si la transition avance ou reste sur place.
  bool canMoveTo(TaskStatus target) => target.rank >= rank;

  /// Etape suivante, ou null si la tache est deja terminee.
  TaskStatus? get next {
    final index = TaskStatus.values.indexOf(this);
    return index < TaskStatus.values.length - 1 ? TaskStatus.values[index + 1] : null;
  }

  bool get isFinal => next == null;
}
