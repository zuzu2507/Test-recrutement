import 'package:flutter_test/flutter_test.dart';
import 'package:task_manager_mobile/models/task_status.dart';

void main() {
  group('TaskStatus — progression a sens unique', () {
    test('autorise une avancee', () {
      expect(TaskStatus.todo.canMoveTo(TaskStatus.inProgress), isTrue);
      expect(TaskStatus.todo.canMoveTo(TaskStatus.done), isTrue);
      expect(TaskStatus.inProgress.canMoveTo(TaskStatus.done), isTrue);
    });

    test('refuse tout retour en arriere', () {
      expect(TaskStatus.done.canMoveTo(TaskStatus.inProgress), isFalse);
      expect(TaskStatus.done.canMoveTo(TaskStatus.todo), isFalse);
      expect(TaskStatus.inProgress.canMoveTo(TaskStatus.todo), isFalse);
    });

    test('autorise le statut identique, pour une simple edition du titre', () {
      for (final status in TaskStatus.values) {
        expect(status.canMoveTo(status), isTrue);
      }
    });

    test('expose la bonne etape suivante', () {
      expect(TaskStatus.todo.next, TaskStatus.inProgress);
      expect(TaskStatus.inProgress.next, TaskStatus.done);
      expect(TaskStatus.done.next, isNull);
      expect(TaskStatus.done.isFinal, isTrue);
      expect(TaskStatus.todo.isFinal, isFalse);
    });

    test('convertit les valeurs echangees avec l API', () {
      expect(TaskStatus.fromWire('IN_PROGRESS'), TaskStatus.inProgress);
      expect(TaskStatus.fromWire('DONE'), TaskStatus.done);
      // Valeur inconnue : repli sur TODO plutot qu'une exception.
      expect(TaskStatus.fromWire('INCONNU'), TaskStatus.todo);
    });
  });
}
