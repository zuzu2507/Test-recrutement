import 'package:flutter_test/flutter_test.dart';
import 'package:task_manager_mobile/models/task.dart';
import 'package:task_manager_mobile/models/task_status.dart';

void main() {
  test('Task.fromJson lit la reponse de l API', () {
    final task = Task.fromJson({
      'id': 7,
      'title': 'Preparer la demo',
      'description': 'Captures et scenario',
      'status': 'IN_PROGRESS',
      'createdAt': '2026-09-17T14:20:21.385237Z',
      'updatedAt': '2026-09-17T14:20:34.618762Z',
    });

    expect(task.id, 7);
    expect(task.title, 'Preparer la demo');
    expect(task.status, TaskStatus.inProgress);
    expect(task.updatedAt.isAfter(task.createdAt), isTrue);
  });

  test('Task.fromJson accepte une description absente', () {
    final task = Task.fromJson({
      'id': 8,
      'title': 'Sans description',
      'description': null,
      'status': 'TODO',
      'createdAt': '2026-09-17T14:20:21Z',
      'updatedAt': '2026-09-17T14:20:21Z',
    });

    expect(task.description, isNull);
    expect(task.status, TaskStatus.todo);
  });
}
