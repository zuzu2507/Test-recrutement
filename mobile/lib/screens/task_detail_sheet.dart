import 'package:flutter/material.dart';

import '../core/design.dart';
import '../models/task.dart';
import '../models/task_status.dart';
import '../widgets/status_badge.dart';

/// Detail d'une tache, avec le parcours de progression.
/// Les etapes deja franchies sont verrouillees : le cycle est a sens unique.
class TaskDetailSheet extends StatelessWidget {
  const TaskDetailSheet({
    super.key,
    required this.task,
    required this.onChangeStatus,
    required this.onEdit,
    required this.onDelete,
  });

  final Task task;
  final void Function(TaskStatus status) onChangeStatus;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  static String _formatDate(DateTime date) =>
      '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.xl),
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
            'TACHE #${task.id}',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.33,
              color: AppColors.inkMuted,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(task.title, style: Theme.of(context).textTheme.headlineMedium),
              ),
              const SizedBox(width: AppSpacing.md),
              StatusBadge(status: task.status),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),

          if (task.description != null && task.description!.isNotEmpty) ...[
            const _SectionTitle('Description'),
            const SizedBox(height: AppSpacing.sm),
            Text(
              task.description!,
              style: const TextStyle(fontSize: 14, height: 1.5, color: AppColors.ink),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          const _SectionTitle('Informations'),
          const SizedBox(height: AppSpacing.sm),
          _InfoRow(label: 'Creee le', value: _formatDate(task.createdAt)),
          _InfoRow(label: 'Derniere modification', value: _formatDate(task.updatedAt)),
          const SizedBox(height: AppSpacing.xl),

          const _SectionTitle('Progression'),
          const SizedBox(height: AppSpacing.sm),
          ...TaskStatus.values.map((step) {
            final current = step == task.status;
            final available = !current && task.status.canMoveTo(step);
            final reached = current || !task.status.canMoveTo(step);
            final (fg, _, _) = StatusBadge.colorsOf(step);

            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Material(
                color: current
                    ? AppColors.accentSoft
                    : available
                        ? AppColors.surface
                        : AppColors.recessed,
                borderRadius: BorderRadius.circular(AppRadius.control),
                child: InkWell(
                  borderRadius: BorderRadius.circular(AppRadius.control),
                  onTap: available ? () => onChangeStatus(step) : null,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: current ? AppColors.accent : AppColors.borderHairline,
                      ),
                      borderRadius: BorderRadius.circular(AppRadius.control),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            color: reached ? fg : AppColors.surface,
                            shape: BoxShape.circle,
                            border: reached ? null : Border.all(color: AppColors.borderStrong),
                          ),
                          child: reached
                              ? const Icon(Icons.check, size: 14, color: Colors.white)
                              : null,
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: Text(
                            step.label,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: current
                                  ? AppColors.accent
                                  : available
                                      ? AppColors.inkMuted
                                      : AppColors.inkDisabled,
                            ),
                          ),
                        ),
                        if (current)
                          const Text(
                            'ACTUEL',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.33,
                              color: AppColors.accent,
                            ),
                          )
                        else if (available)
                          const Icon(Icons.arrow_forward, size: 16, color: AppColors.inkMuted)
                        else
                          const Icon(Icons.lock_outline, size: 14, color: AppColors.inkDisabled),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),

          if (task.status.isFinal)
            Container(
              margin: const EdgeInsets.only(top: 6),
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.doneBg,
                borderRadius: BorderRadius.circular(AppRadius.control),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_outline, size: 16, color: AppColors.doneFg),
                  SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Tache terminee. Le statut ne peut plus etre modifie.',
                      style: TextStyle(fontSize: 12, color: AppColors.doneFg),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: AppSpacing.xl),
          ElevatedButton.icon(
            onPressed: onEdit,
            icon: const Icon(Icons.edit_outlined, size: 18),
            label: const Text('Modifier'),
          ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton.icon(
            onPressed: onDelete,
            icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.danger),
            label: const Text('Supprimer', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.33,
          color: AppColors.inkMuted,
        ),
      );
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
          children: [
            Expanded(
              child: Text(label, style: const TextStyle(fontSize: 13, color: AppColors.inkMuted)),
            ),
            Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.ink),
            ),
          ],
        ),
      );
}
