import 'package:flutter/material.dart';

import 'core/design.dart';
import 'core/theme.dart';
import 'screens/login_screen.dart';
import 'screens/tasks_screen.dart';
import 'state/auth_controller.dart';

void main() {
  runApp(const TaskManagerApp());
}

class TaskManagerApp extends StatefulWidget {
  const TaskManagerApp({super.key});

  @override
  State<TaskManagerApp> createState() => _TaskManagerAppState();
}

class _TaskManagerAppState extends State<TaskManagerApp> {
  final _auth = AuthController();

  @override
  void initState() {
    super.initState();
    _auth.addListener(_onAuthChanged);
    _auth.bootstrap();
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChanged);
    _auth.dispose();
    super.dispose();
  }

  void _onAuthChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaskFlow',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: _buildHome(),
    );
  }

  Widget _buildHome() {
    // Tant que le jeton stocke n'est pas revalide, on n'affiche ni l'app ni
    // l'ecran de connexion : rediriger trop tot ferait clignoter le login a
    // chaque lancement pour un utilisateur pourtant authentifie.
    if (_auth.initializing) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.accent)),
      );
    }

    return _auth.user == null ? LoginScreen(auth: _auth) : TasksScreen(auth: _auth);
  }
}
