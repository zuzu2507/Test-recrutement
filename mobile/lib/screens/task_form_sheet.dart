import 'package:flutter/material.dart';

import '../core/design.dart';
import '../models/task.dart';
import '../models/task_status.dart';
import '../widgets/status_badge.dart';

class TaskFormResult {
  const TaskFormResult({required this.title, this.description, this.status});

  final String title;
  final String? description;
  final TaskStatus? status;
}

/// Formulaire de creation et d'edition, en feuille modale.
/// A l'edition, les statuts deja franchis sont desactives : la progression
/// est a sens unique et le backend refuserait un retour en arriere.
class TaskFormSheet extends StatefulWidget {
  const TaskFormSheet({super.key, this.task});

  final Task? task;

  @override
  State<TaskFormSheet> createState() => _TaskFormSheetState();
}

class _TaskFormSheetState extends State<TaskFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _title;
  late final TextEditingController _description;
  late TaskStatus _status;

  static const _titleMax = 150;

  @override
  void initState() {
    super.initState();
    _title = TextEditingController(text: widget.task?.title ?? '');
    _description = TextEditingController(text: widget.task?.description ?? '');
    _status = widget.task?.status ?? TaskStatus.todo;
  }

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.of(context).pop(TaskFormResult(
      title: _title.text,
      description: _description.text,
      status: _status,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.task != null;

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.borderStrong,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              Text(
                editing ? 'Modifier la tâche' : 'Nouvelle tâche',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: AppSpacing.xl),

              const Text('Titre', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _title,
                maxLength: _titleMax,
                autofocus: !editing,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(hintText: 'Ex. Préparer la réunion'),
                validator: (value) =>
                    (value == null || value.trim().isEmpty) ? 'Le titre est obligatoire' : null,
              ),
              const SizedBox(height: AppSpacing.sm),

              const Text('Description', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _description,
                maxLines: 4,
                decoration: const InputDecoration(hintText: 'Optionnelle'),
              ),
              const SizedBox(height: AppSpacing.lg),

              const Text('Statut', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                children: TaskStatus.values.map((value) {
                  final allowed = widget.task == null || widget.task!.status.canMoveTo(value);
                  final selected = _status == value;
                  final (fg, _, _) = StatusBadge.colorsOf(value);

                  return ChoiceChip(
                    label: Text(value.label),
                    selected: selected,
                    onSelected: allowed ? (_) => setState(() => _status = value) : null,
                    avatar: allowed
                        ? CircleAvatar(backgroundColor: fg, radius: 5)
                        : const Icon(Icons.lock_outline, size: 14, color: AppColors.inkDisabled),
                    selectedColor: AppColors.accentSoft,
                    backgroundColor: AppColors.surface,
                    disabledColor: AppColors.recessed,
                    labelStyle: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: !allowed
                          ? AppColors.inkDisabled
                          : selected
                              ? AppColors.accent
                              : AppColors.inkMuted,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadius.control),
                      side: BorderSide(
                        color: selected ? AppColors.accent : AppColors.borderHairline,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: AppSpacing.xl),

              ElevatedButton(
                onPressed: _submit,
                child: Text(editing ? 'Enregistrer' : 'Créer la tâche'),
              ),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Annuler'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
