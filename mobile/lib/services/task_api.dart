import '../models/task.dart';
import '../models/task_status.dart';
import 'api_client.dart';

class TaskApi {
  TaskApi(this._client);

  final ApiClient _client;

  /// Le filtrage et la recherche sont delegues a l'API, pas refaits en memoire.
  Future<List<Task>> list({TaskStatus? status, String? search}) async {
    final query = <String, dynamic>{};
    if (status != null) query['status'] = status.wire;
    if (search != null && search.trim().isNotEmpty) query['search'] = search.trim();

    final data = await _client.get('/api/tasks', query: query.isEmpty ? null : query) as List<dynamic>;
    return data.map((item) => Task.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Task> create({
    required String title,
    String? description,
    TaskStatus? status,
  }) async {
    final data = await _client.post('/api/tasks', body: {
      'title': title.trim(),
      'description': (description == null || description.trim().isEmpty) ? null : description.trim(),
      if (status != null) 'status': status.wire,
    }) as Map<String, dynamic>;

    return Task.fromJson(data);
  }

  Future<Task> update(
    int id, {
    required String title,
    String? description,
    TaskStatus? status,
  }) async {
    final data = await _client.put('/api/tasks/$id', body: {
      'title': title.trim(),
      'description': (description == null || description.trim().isEmpty) ? null : description.trim(),
      if (status != null) 'status': status.wire,
    }) as Map<String, dynamic>;

    return Task.fromJson(data);
  }

  Future<void> delete(int id) => _client.delete('/api/tasks/$id');
}
