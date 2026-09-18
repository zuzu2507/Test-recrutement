import 'package:flutter/material.dart';
import 'design.dart';

/// Theme Material derive des tokens de DESIGN.md.
ThemeData buildAppTheme() {
  const outline = OutlineInputBorder(
    borderSide: BorderSide(color: AppColors.borderHairline),
    borderRadius: BorderRadius.all(Radius.circular(AppRadius.control)),
  );

  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.canvas,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.accent,
      primary: AppColors.accent,
      surface: AppColors.surface,
      error: AppColors.danger,
    ),
    fontFamily: 'Inter',

    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.surface,
      surfaceTintColor: Colors.transparent,
      foregroundColor: AppColors.ink,
      elevation: 0,
      scrolledUnderElevation: 0,
      shape: Border(bottom: BorderSide(color: AppColors.borderHairline)),
    ),

    // Hauteur 38px, rayon 8px, anneau de focus accent (DESIGN.md > Form Inputs).
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      hintStyle: const TextStyle(color: AppColors.inkDisabled, fontSize: 14),
      border: outline,
      enabledBorder: outline,
      focusedBorder: outline.copyWith(
        borderSide: const BorderSide(color: AppColors.accent, width: 2),
      ),
      errorBorder: outline.copyWith(
        borderSide: const BorderSide(color: AppColors.danger),
      ),
      focusedErrorBorder: outline.copyWith(
        borderSide: const BorderSide(color: AppColors.danger, width: 2),
      ),
      errorStyle: const TextStyle(color: AppColors.danger, fontSize: 12),
    ),

    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.accent,
        foregroundColor: Colors.white,
        disabledBackgroundColor: AppColors.borderStrong,
        disabledForegroundColor: Colors.white,
        elevation: 0,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.control),
        ),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),

    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.ink,
        backgroundColor: AppColors.surface,
        side: const BorderSide(color: AppColors.borderHairline),
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.control),
        ),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),

    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.accent,
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),

    dividerTheme: const DividerThemeData(
      color: AppColors.borderHairline,
      thickness: 1,
      space: 1,
    ),

    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: AppColors.ink,
      contentTextStyle: const TextStyle(color: Colors.white, fontSize: 13),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.control),
      ),
    ),

    textTheme: const TextTheme(
      // Plus Jakarta Sans pour les titres, Inter pour l'operationnel.
      headlineLarge: TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.6,
        color: AppColors.ink,
      ),
      headlineMedium: TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 20,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
        color: AppColors.ink,
      ),
      titleMedium: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.ink),
      bodyMedium: TextStyle(fontSize: 14, color: AppColors.ink),
      bodySmall: TextStyle(fontSize: 12, color: AppColors.inkMuted),
    ),
  );
}
