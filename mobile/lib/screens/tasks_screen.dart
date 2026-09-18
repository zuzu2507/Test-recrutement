import 'dart:async';

import 'package:flutter/material.dart';

import '../core/api_exception.dart';
import '../core/design.dart';
import '../models/task.dart';
import '../models/task_status.dart';
import '../state/auth_controller.dart';
import '../state/task_controller.dart';
import '../widgets/brand_logo.dart';
import '../widgets/task_tile.dart';
import 'task_detail_sheet.dart';
import 'task_form_sheet.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  late final TaskController _tasks;
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _tasks = TaskController(widget.auth.client);
    _tasks.addListener(_onChanged);
    _tasks.refresh();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _tasks.removeListener(_onChanged);
    _tasks.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onChanged() {
    if (mounted) setState(() {});
  }

  /// Recherche debouncee : evite un appel API a chaque frappe.
  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () => _tasks.setSearch(value));
  }

  void _notify(Object error) {
    final message = error is ApiException ? error.message : 'Une erreur est survenue.';
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  Future<void> _openForm({Task? task}) async {
    final result = await showModalBottomSheet<TaskFormResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.card)),
      ),
      builder: (_) => TaskFormSheet(task: task),
    );

    if (result == null) return;

    try {
      if (task == null) {
        await _tasks.create(
          title: result.title,
          description: result.description,
          status: result.status,
        );
      } else {
        await _tasks.update(
          task,
          title: result.title,
          description: result.description,
          status: result.status,
        );
      }
    } catch (error) {
      _notify(error);
    }
  }

  Future<void> _openDetail(Task task) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.card)),
      ),
      builder: (sheetContext) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.75,
        maxChildSize: 0.95,
        builder: (_, controller) => SingleChildScrollView(
          controller: controller,
          child: TaskDetailSheet(
            task: task,
            onChangeStatus: (status) async {
              Navigator.of(sheetContext).pop();
              try {
                await _tasks.changeStatus(task, status);
              } catch (error) {
                _notify(error);
              }
            },
            onEdit: () {
              Navigator.of(sheetContext).pop();
              _openForm(task: task);
            },
            onDelete: () {
              Navigator.of(sheetContext).pop();
              _confirmDelete(task);
            },
          ),
        ),
      ),
    );
  }

  Future<void> _confirmDelete(Task task) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.card)),
        title: const Text('Supprimer la tache'),
        content: Text(
          'Voulez-vous vraiment supprimer « ${task.title} » ? Cette action est irreversible.',
          style: const TextStyle(fontSize: 14, color: AppColors.inkMuted, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Supprimer', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      await _tasks.delete(task);
    } catch (error) {
      _notify(error);
    }
  }

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.card)),
        title: const Text('Deconnexion'),
        content: const Text(
          'Voulez-vous vous deconnecter ?',
          style: TextStyle(fontSize: 14, color: AppColors.inkMuted, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Se deconnecter'),
          ),
        ],
      ),
    );

    if (confirmed == true) await widget.auth.logout();
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const BrandLogo(),
        actions: [
          IconButton(
            tooltip: 'Se deconnecter',
            icon: const Icon(Icons.logout, size: 20, color: AppColors.inkMuted),
            onPressed: _confirmLogout,
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openForm(),
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Nouvelle tache'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Mes taches', style: Theme.of(context).textTheme.headlineLarge),
                  if (user != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Connecte en tant que ${user.name}',
                      style: const TextStyle(fontSize: 13, color: AppColors.inkMuted),
                    ),
                  ],
                  const SizedBox(height: AppSpacing.lg),

                  TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Rechercher une tache...',
                      fillColor: AppColors.recessed,
                      prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.inkDisabled),
                      suffixIcon: _searchController.text.isEmpty
                          ? null
                          : IconButton(
                              icon: const Icon(Icons.close, size: 18, color: AppColors.inkDisabled),
                              onPressed: () {
                                _searchController.clear();
                                _tasks.setSearch('');
                              },
                            ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _FilterChip(
                          label: 'Toutes',
                          count: _tasks.tasks.length,
                          selected: _tasks.statusFilter == null,
                          onTap: () => _tasks.setStatusFilter(null),
                        ),
                        ...TaskStatus.values.map(
                          (status) => _FilterChip(
                            label: status.label,
                            count: _tasks.countOf(status),
                            selected: _tasks.statusFilter == status,
                            onTap: () => _tasks.setStatusFilter(status),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(child: _buildList()),
          ],
        ),
      ),
    );
  }

  Widget _buildList() {
    if (_tasks.loading && _tasks.tasks.isEmpty) {
      return const Center(child: CircularProgressIndicator(color: AppColors.accent));
    }

    if (_tasks.error != null && _tasks.tasks.isEmpty) {
      return _EmptyState(
        icon: Icons.cloud_off_outlined,
        title: 'Serveur injoignable',
        message: _tasks.error!,
        actionLabel: 'Reessayer',
        onAction: _tasks.refresh,
      );
    }

    if (_tasks.tasks.isEmpty) {
      final filtered = _tasks.statusFilter != null || _tasks.search.trim().isNotEmpty;
      return _EmptyState(
        icon: filtered ? Icons.search_off : Icons.checklist_rounded,
        title: filtered ? 'Aucun resultat' : 'Aucune tache pour le moment',
        message: filtered
            ? 'Aucune tache ne correspond a votre recherche ou au filtre selectionne.'
            : 'Creez votre premiere tache pour commencer a organiser votre journee.',
        actionLabel: filtered ? 'Reinitialiser' : 'Creer une tache',
        onAction: () {
          if (filtered) {
            _searchController.clear();
            _tasks.setStatusFilter(null);
            _tasks.setSearch('');
          } else {
            _openForm();
          }
        },
      );
    }

    return RefreshIndicator(
      color: AppColors.accent,
      onRefresh: _tasks.refresh,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 96),
        itemCount: _tasks.tasks.length,
        itemBuilder: (_, index) {
          final task = _tasks.tasks[index];
          return TaskTile(
            task: task,
            busy: _tasks.busyId == task.id,
            onTap: () => _openDetail(task),
            onAdvance: () async {
              try {
                await _tasks.advance(task);
              } catch (error) {
                _notify(error);
              }
            },
          );
        },
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: AppSpacing.sm),
      child: Material(
        color: selected ? AppColors.accentSoft : AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.control),
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.control),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              border: Border.all(
                color: selected ? AppColors.accent : AppColors.borderHairline,
              ),
              borderRadius: BorderRadius.circular(AppRadius.control),
            ),
            child: Row(
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: selected ? AppColors.accent : AppColors.inkMuted,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.accent : AppColors.recessed,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '$count',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: selected ? Colors.white : AppColors.inkMuted,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl + AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border.all(color: AppColors.borderHairline),
                borderRadius: BorderRadius.circular(AppRadius.card),
                boxShadow: AppShadows.level1,
              ),
              child: Icon(icon, size: 28, color: AppColors.accent),
            ),
            const SizedBox(height: AppSpacing.xl),
            Text(title, style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, height: 1.5, color: AppColors.inkMuted),
            ),
            const SizedBox(height: AppSpacing.xl),
            OutlinedButton(onPressed: onAction, child: Text(actionLabel)),
          ],
        ),
      ),
    );
  }
}
