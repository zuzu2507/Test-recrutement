import 'package:flutter/foundation.dart';

/// Adresse de l'API Spring Boot.
///
/// L'hote varie selon la cible : un emulateur Android ne voit pas le
/// `localhost` de la machine hote, il doit passer par 10.0.2.2. La valeur
/// reste surchargeable au lancement :
///   flutter run --dart-define=API_BASE_URL=http://192.168.1.20:8080
class ApiConfig {
  const ApiConfig._();

  static const _override = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_override.isNotEmpty) return _override;
    if (kIsWeb) return 'http://localhost:8080';
    if (defaultTargetPlatform == TargetPlatform.android) {
      // Alias de la machine hote depuis l'emulateur Android.
      return 'http://10.0.2.2:8080';
    }
    return 'http://localhost:8080';
  }
}
