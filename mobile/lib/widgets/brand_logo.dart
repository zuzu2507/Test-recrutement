import 'package:flutter/material.dart';

import '../core/design.dart';

/// Marque TaskFlow : tuile gradient et monogramme, identique au web.
class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key, this.showWordmark = true, this.onDark = false});

  final bool showWordmark;
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            gradient: brandGradient,
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.checklist_rounded, color: Colors.white, size: 20),
        ),
        if (showWordmark) ...[
          const SizedBox(width: 10),
          Text(
            'TaskFlow',
            style: TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 20,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.4,
              color: onDark ? Colors.white : AppColors.ink,
            ),
          ),
        ],
      ],
    );
  }
}
