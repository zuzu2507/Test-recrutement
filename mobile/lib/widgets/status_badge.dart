import 'package:flutter/material.dart';

import '../core/design.dart';
import '../models/task_status.dart';

/// Pastille de statut : 22px de haut, rayon plein, libelle en majuscules
/// (DESIGN.md > Status Badges & Chips).
class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status});

  final TaskStatus status;

  static (Color fg, Color bg, Color br) colorsOf(TaskStatus status) => switch (status) {
        TaskStatus.todo => (AppColors.todoFg, AppColors.todoBg, AppColors.todoBr),
        TaskStatus.inProgress => (AppColors.progressFg, AppColors.progressBg, AppColors.progressBr),
        TaskStatus.done => (AppColors.doneFg, AppColors.doneBg, AppColors.doneBr),
      };

  @override
  Widget build(BuildContext context) {
    final (fg, bg, br) = colorsOf(status);

    return Container(
      height: 22,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: br),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: fg, shape: BoxShape.circle),
          ),
          const SizedBox(width: 6),
          Text(
            status.label.toUpperCase(),
            style: TextStyle(
              color: fg,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.33,
            ),
          ),
        ],
      ),
    );
  }
}
