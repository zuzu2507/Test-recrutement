import 'package:dio/dio.dart';

import '../core/api_config.dart';
import '../core/api_exception.dart';
import 'token_store.dart';

/// Client HTTP unique de l'application.
///
/// Il joint le jeton JWT a chaque appel, traduit les reponses d'erreur du
/// backend en [ApiException], et previent l'application quand la session
/// n'est plus valide.
class ApiClient {
  ApiClient({required TokenStore tokenStore, this.onUnauthorized})
      : _tokenStore = tokenStore {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      contentType: Headers.jsonContentType,
      // On accepte tous les statuts pour traduire nous-memes les erreurs
      // plutot que de laisser Dio lever une exception opaque.
      validateStatus: (_) => true,
    ));
  }

  final TokenStore _tokenStore;
  final void Function()? onUnauthorized;
  late final Dio _dio;

  Future<Options> _options() async {
    final token = await _tokenStore.read();
    return Options(
      headers: token == null ? null : {'Authorization': 'Bearer $token'},
    );
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) =>
      _send(() async => _dio.get(path, queryParameters: query, options: await _options()));

  Future<dynamic> post(String path, {Object? body}) =>
      _send(() async => _dio.post(path, data: body, options: await _options()));

  Future<dynamic> put(String path, {Object? body}) =>
      _send(() async => _dio.put(path, data: body, options: await _options()));

  Future<dynamic> delete(String path) =>
      _send(() async => _dio.delete(path, options: await _options()));

  Future<dynamic> _send(Future<Response<dynamic>> Function() request) async {
    late final Response<dynamic> response;
    try {
      response = await request();
    } on DioException catch (error) {
      // Aucune reponse recue : l'API est injoignable.
      throw ApiException(
        error.type == DioExceptionType.connectionTimeout ||
                error.type == DioExceptionType.receiveTimeout
            ? "Le serveur ne repond pas. Verifiez qu'il est demarre."
            : "Impossible de joindre le serveur (${ApiConfig.baseUrl}).",
        0,
      );
    }

    final status = response.statusCode ?? 0;

    if (status == 401) {
      onUnauthorized?.call();
      throw ApiException('Session expiree, veuillez vous reconnecter.', 401);
    }

    if (status >= 200 && status < 300) return response.data;

    final data = response.data;
    if (data is Map<String, dynamic>) {
      final rawFieldErrors = data['fieldErrors'];
      return throw ApiException(
        (data['message'] as String?) ?? 'Erreur $status',
        status,
        rawFieldErrors is Map
            ? rawFieldErrors.map((key, value) => MapEntry('$key', '$value'))
            : null,
      );
    }

    throw ApiException('Erreur $status', status);
  }
}
