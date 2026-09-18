import 'package:flutter/foundation.dart';

import '../models/task.dart';
import '../services/api_client.dart';
import '../services/auth_api.dart';
import '../services/token_store.dart';

/// Session de l'utilisateur. Expose l'etat d'amorcage pour ne pas faire
/// clignoter l'ecran de connexion pendant la revalidation du jeton.
class AuthController extends ChangeNotifier {
  AuthController() {
    _tokenStore = TokenStore();
    _client = ApiClient(tokenStore: _tokenStore, onUnauthorized: _onUnauthorized);
    _authApi = AuthApi(_client);
  }

  late final TokenStore _tokenStore;
  late final ApiClient _client;
  late final AuthApi _authApi;

  ApiClient get client => _client;

  User? _user;
  User? get user => _user;

  bool _initializing = true;
  bool get initializing => _initializing;

  /// Au demarrage, un jeton stocke ne prouve rien : il peut etre expire ou
  /// correspondre a un compte supprime. On le revalide avant d'ouvrir l'app.
  Future<void> bootstrap() async {
    final token = await _tokenStore.read();
    if (token != null) {
      try {
        _user = await _authApi.me();
      } catch (_) {
        await _tokenStore.clear();
      }
    }
    _initializing = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final result = await _authApi.login(email, password);
    await _tokenStore.write(result.token);
    _user = result.user;
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    final result = await _authApi.register(name, email, password);
    await _tokenStore.write(result.token);
    _user = result.user;
    notifyListeners();
  }

  Future<void> logout() async {
    await _tokenStore.clear();
    _user = null;
    notifyListeners();
  }

  void _onUnauthorized() {
    // Un 401 sur n'importe quel appel purge la session.
    _tokenStore.clear();
    if (_user != null) {
      _user = null;
      notifyListeners();
    }
  }
}
