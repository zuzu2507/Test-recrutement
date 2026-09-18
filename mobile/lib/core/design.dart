import 'package:flutter/material.dart';

/// Tokens du design system "Precision Focus", traduits depuis DESIGN.md.
/// Aucune couleur brute ne doit apparaitre ailleurs dans l'application.
class AppColors {
  const AppColors._();

  static const canvas = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const recessed = Color(0xFFF1F5F9);
  static const borderHairline = Color(0xFFE2E8F0);
  static const borderStrong = Color(0xFFCBD5E1);

  static const brand = Color(0xFF1E3A8A);
  static const accent = Color(0xFF2563EB);
  static const accentSoft = Color(0xFFEFF6FF);

  static const ink = Color(0xFF0F172A);
  static const inkMuted = Color(0xFF64748B);
  static const inkDisabled = Color(0xFF94A3B8);

  static const todoFg = Color(0xFF64748B);
  static const todoBg = Color(0xFFF1F5F9);
  static const todoBr = Color(0xFFE2E8F0);

  static const progressFg = Color(0xFFD97706);
  static const progressBg = Color(0xFFFEF3C7);
  static const progressBr = Color(0xFFFDE68A);

  static const doneFg = Color(0xFF059669);
  static const doneBg = Color(0xFFD1FAE5);
  static const doneBr = Color(0xFFA7F3D0);

  static const danger = Color(0xFFDC2626);
  static const dangerBg = Color(0xFFFEE2E2);
}

class AppRadius {
  const AppRadius._();

  /// Cartes et dialogues (DESIGN.md : rounded-xl, 12px).
  static const card = 12.0;

  /// Controles et champs (DESIGN.md : rounded-md, 8px).
  static const control = 8.0;
}

class AppSpacing {
  const AppSpacing._();

  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
}

class AppShadows {
  const AppShadows._();

  /// Elevations teintees, jamais d'ombre noire franche.
  static const level1 = [
    BoxShadow(color: Color(0x0D0F172A), blurRadius: 3, offset: Offset(0, 1)),
    BoxShadow(color: Color(0x0D0F172A), blurRadius: 2, offset: Offset(0, 1)),
  ];

  static const level2 = [
    BoxShadow(color: Color(0x120F172A), blurRadius: 6, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x0D0F172A), blurRadius: 4, offset: Offset(0, 2)),
  ];

  static const level4 = [
    BoxShadow(color: Color(0x1A0F172A), blurRadius: 25, offset: Offset(0, 20)),
    BoxShadow(color: Color(0x0A0F172A), blurRadius: 10, offset: Offset(0, 8)),
  ];
}

/// Gradient de marque, reserve aux actions primaires et aux ecrans
/// d'authentification (DESIGN.md).
const brandGradient = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [AppColors.brand, AppColors.accent],
);
