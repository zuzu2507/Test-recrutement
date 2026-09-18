import 'package:flutter/foundation.dart';

import '../core/api_exception.dart';
import '../models/task.dart';
import '../models/task_status.dart';
import '../services/api_client.dart';
import '../services/task_api.dart';

class TaskController extends ChangeNotifier {
  TaskController(ApiClient client) : _api = TaskApi(client);

  final TaskApi _api;

  List<Task> _tasks = const [];
  List<Task> get tasks => _tasks;

  bool _loading = true;
  bool get loading => _loading;

  String? _error;
  String? get error => _error;

  TaskStatus? _statusFilter;
  TaskStatus? get statusFilter => _statusFilter;

  String _search = '';
  String get search => _search;

  int? _busyId;
  int? get busyId => _busyId;

  /// Evite qu'une reponse lente d'une recherche precedente n'ecrase
  /// le resultat d'une saisie plus recente.
  int _requestId = 0;

  Future<void> refresh() async {
    final current = ++_requestId;
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.list(status: _statusFilter, search: _search);
      if (current != _requestId) return;
      _tasks = result;
    } on ApiException catch (error) {
      if (current != _requestId) return;
      if (!error.isUnauthorized) _error = error.message;
    } finally {
      if (current == _requestId) {
        _loading = false;
        notifyListeners();
      }
    }
  }

  Future<void> setStatusFilter(TaskStatus? status) async {
    _statusFilter = status;
    await refresh();
  }

  Future<void> setSearch(String value) async {
    _search = value;
    await refresh();
  }

  Future<void> create({
    required String title,
    String? description,
    TaskStatus? status,
  }) async {
    await _api.create(title: title, description: description, status: status);
    await refresh();
  }

  Future<void> update(
    Task task, {
    required String title,
    String? description,
    TaskStatus? status,
  }) async {
    await _api.update(task.id, title: title, description: description, status: status);
    await refresh();
  }

  Future<void> delete(Task task) async {
    _busyId = task.id;
    notifyListeners();
    try {
      await _api.delete(task.id);
      await refresh();
    } finally {
      _busyId = null;
      notifyListeners();
    }
  }

  /// Fait avancer une tache. La progression est a sens unique : le backend
  /// refuse tout retour en arriere par un 409, on ne tente meme pas l'appel.
  Future<void> changeStatus(Task task, TaskStatus status) async {
    if (!task.status.canMoveTo(status)) return;

    _busyId = task.id;
    notifyListeners();
    try {
      await _api.update(
        task.id,
        title: task.title,
        description: task.description,
        status: status,
      );
      await refresh();
    } finally {
      _busyId = null;
      notifyListeners();
    }
  }

  Future<void> advance(Task task) async {
    final upcoming = task.status.next;
    if (upcoming != null) await changeStatus(task, upcoming);
  }

  int countOf(TaskStatus status) => _tasks.where((t) => t.status == status).length;
}
