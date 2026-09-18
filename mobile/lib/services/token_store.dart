import 'package:shared_preferences/shared_preferences.dart';

/// Conservation du jeton JWT entre deux lancements de l'application.
class TokenStore {
  static const _key = 'taskflow.token';

  Future<String?> read() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_key);
  }

  Future<void> write(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, token);
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
