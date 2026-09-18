import '../models/task.dart';
import 'api_client.dart';

class AuthResult {
  const AuthResult({required this.token, required this.user});

  final String token;
  final User user;
}

class AuthApi {
  AuthApi(this._client);

  final ApiClient _client;

  Future<AuthResult> register(String name, String email, String password) async {
    final data = await _client.post('/api/auth/register', body: {
      'name': name.trim(),
      'email': email.trim().toLowerCase(),
      'password': password,
    }) as Map<String, dynamic>;

    return AuthResult(
      token: data['token'] as String,
      user: User.fromJson(data['user'] as Map<String, dynamic>),
    );
  }

  Future<AuthResult> login(String email, String password) async {
    final data = await _client.post('/api/auth/login', body: {
      'email': email.trim().toLowerCase(),
      'password': password,
    }) as Map<String, dynamic>;

    return AuthResult(
      token: data['token'] as String,
      user: User.fromJson(data['user'] as Map<String, dynamic>),
    );
  }

  /// Revalide un jeton conserve localement : sa presence ne prouve pas
  /// qu'il soit encore valide.
  Future<User> me() async {
    final data = await _client.get('/api/auth/me') as Map<String, dynamic>;
    return User.fromJson(data);
  }
}
