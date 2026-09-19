import 'package:flutter/material.dart';

import '../core/api_exception.dart';
import '../core/design.dart';
import '../state/auth_controller.dart';
import '../widgets/brand_logo.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  bool _submitting = false;
  bool _obscure = true;
  Map<String, String> _fieldErrors = const {};

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _fieldErrors = const {};
    });

    try {
      await widget.auth.login(_email.text, _password.text);
      // La navigation est pilotee par l'ecouteur d'etat dans main.dart.
    } on ApiException catch (error) {
      if (!mounted) return;
      // Erreurs de champ sous les champs, le reste en bandeau.
      if (error.fieldErrors != null) {
        setState(() => _fieldErrors = error.fieldErrors!);
        _formKey.currentState!.validate();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Center(child: BrandLogo()),
                    const SizedBox(height: AppSpacing.xl + AppSpacing.lg),

                    Text('Bon retour', style: Theme.of(context).textTheme.headlineLarge),
                    const SizedBox(height: AppSpacing.sm),
                    const Text(
                      'Connectez-vous pour retrouver vos tâches.',
                      style: TextStyle(color: AppColors.inkMuted, fontSize: 14),
                    ),
                    const SizedBox(height: AppSpacing.xl),

                    const _Label('Adresse email'),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        hintText: 'vous@exemple.com',
                        prefixIcon: Icon(Icons.mail_outline, size: 18, color: AppColors.inkDisabled),
                      ),
                      validator: (value) {
                        if (_fieldErrors['email'] != null) return _fieldErrors['email'];
                        if (value == null || value.trim().isEmpty) return "L'email est obligatoire";
                        if (!value.contains('@')) return "Format d'email invalide";
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    const _Label('Mot de passe'),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _password,
                      obscureText: _obscure,
                      autofillHints: const [AutofillHints.password],
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: InputDecoration(
                        hintText: 'Votre mot de passe',
                        prefixIcon: const Icon(Icons.lock_outline, size: 18, color: AppColors.inkDisabled),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            size: 18,
                            color: AppColors.inkDisabled,
                          ),
                          onPressed: () => setState(() => _obscure = !_obscure),
                          tooltip: _obscure ? 'Afficher' : 'Masquer',
                        ),
                      ),
                      validator: (value) {
                        if (_fieldErrors['password'] != null) return _fieldErrors['password'];
                        if (value == null || value.isEmpty) return 'Le mot de passe est obligatoire';
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.xl),

                    ElevatedButton(
                      onPressed: _submitting ? null : _submit,
                      child: _submitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Se connecter'),
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Pas encore de compte ?',
                          style: TextStyle(color: AppColors.inkMuted, fontSize: 14),
                        ),
                        TextButton(
                          onPressed: _submitting
                              ? null
                              : () => Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => RegisterScreen(auth: widget.auth),
                                    ),
                                  ),
                          child: const Text('Créer un compte'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.ink),
      );
}
