/// Erreur applicative portant le message normalise renvoye par l'API.
///
/// Le backend repond toujours le meme format d'erreur
/// (timestamp, status, error, message, path, fieldErrors) : on l'expose tel
/// quel pour afficher les messages de validation sous les champs concernes.
class ApiException implements Exception {
  ApiException(this.message, this.statusCode, [this.fieldErrors]);

  final String message;
  final int statusCode;
  final Map<String, String>? fieldErrors;

  /// Le jeton est absent, invalide ou expire : la session doit etre purgee.
  bool get isUnauthorized => statusCode == 401;

  /// Regle metier refusee, par exemple un retour en arriere du statut.
  bool get isConflict => statusCode == 409;

  @override
  String toString() => message;
}
