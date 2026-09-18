import 'task_status.dart';

class Task {
  const Task({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  final int id;
  final String title;
  final String? description;
  final TaskStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory Task.fromJson(Map<String, dynamic> json) => Task(
        id: json['id'] as int,
        title: json['title'] as String,
        description: json['description'] as String?,
        status: TaskStatus.fromWire(json['status'] as String),
        createdAt: DateTime.parse(json['createdAt'] as String).toLocal(),
        updatedAt: DateTime.parse(json['updatedAt'] as String).toLocal(),
      );
}

class User {
  const User({required this.id, required this.name, required this.email});

  final int id;
  final String name;
  final String email;

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as int,
        name: json['name'] as String,
        email: json['email'] as String,
      );
}
