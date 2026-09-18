import 'package:flutter/material.dart';

import '../core/design.dart';
import '../models/task.dart';
import '../models/task_status.dart';
import 'status_badge.dart';

/// Carte de tache : bordure hairline, rayon 12px, elevation niveau 1 et
/// accent lateral de 3px (DESIGN.md > Task Cards).
class TaskTile extends StatelessWidget {
  const TaskTile({
    super.key,
    required this.task,
    required this.busy,
    required this.onTap,
    required this.onAdvance,
  });

  final Task task;
  final bool busy;
  final VoidCallback onTap;
  final VoidCallback onAdvance;

  @override
  Widget build(BuildContext context) {
    final done = task.status == TaskStatus.done;
    final (accent, _, _) = StatusBadge.colorsOf(task.status);

    return Opacity(
      opacity: busy ? 0.55 : 1,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border.all(color: AppColors.borderHairline),
          borderRadius: BorderRadius.circular(AppRadius.card),
          boxShadow: AppShadows.level1,
        ),
        clipBehavior: Clip.antiAlias,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: busy ? null : onTap,
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(width: 3, color: accent),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(AppSpacing.md, 14, AppSpacing.md, 14),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Une tache terminee ne peut plus reculer : la case
                          // devient un indicateur, non decochable.
                          Checkbox(
                            value: done,
                            onChanged: (busy || done) ? null : (_) => onAdvance(),
                            activeColor: AppColors.accent,
                            side: const BorderSide(color: AppColors.borderStrong, width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            visualDensity: VisualDensity.compact,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  task.title,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: done ? AppColors.inkMuted : AppColors.ink,
                                    decoration: done ? TextDecoration.lineThrough : null,
                                  ),
                                ),
                                if (task.description != null && task.description!.isNotEmpty) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    task.description!,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 13, color: AppColors.inkMuted),
                                  ),
                                ],
                                const SizedBox(height: AppSpacing.sm),
                                StatusBadge(status: task.status),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, color: AppColors.inkDisabled, size: 20),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
