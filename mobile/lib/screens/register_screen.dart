import 'package:flutter/material.dart';

import '../core/api_exception.dart';
import '../core/design.dart';
import '../state/auth_controller.dart';
import '../widgets/brand_logo.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key, required this.auth});

  final AuthController auth;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();

  static const _minPasswordLength = 6;

  bool _submitting = false;
  Map<String, String> _fieldErrors = const {};

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _fieldErrors = const {};
    });

    try {
      await widget.auth.register(_name.text, _email.text, _password.text);
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (error) {
      if (!mounted) return;
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
      appBar: AppBar(title: const BrandLogo(showWordmark: false), centerTitle: false),
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
                    Text('Creer votre compte', style: Theme.of(context).textTheme.headlineLarge),
                    const SizedBox(height: AppSpacing.sm),
                    const Text(
                      'Commencez a organiser vos taches en quelques secondes.',
                      style: TextStyle(color: AppColors.inkMuted, fontSize: 14),
                    ),
                    const SizedBox(height: AppSpacing.xl),

                    const _Label('Nom complet'),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _name,
                      textCapitalization: TextCapitalization.words,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        hintText: 'Zuber Ndengue',
                        prefixIcon: Icon(Icons.person_outline, size: 18, color: AppColors.inkDisabled),
                      ),
                      validator: (value) {
                        if (_fieldErrors['name'] != null) return _fieldErrors['name'];
                        if (value == null || value.trim().isEmpty) return 'Le nom est obligatoire';
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    const _Label('Adresse email'),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
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
                      obscureText: true,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        hintText: '$_minPasswordLength caracteres minimum',
                        prefixIcon: Icon(Icons.lock_outline, size: 18, color: AppColors.inkDisabled),
                      ),
                      validator: (value) {
                        if (_fieldErrors['password'] != null) return _fieldErrors['password'];
                        if (value == null || value.length < _minPasswordLength) {
                          return 'Au moins $_minPasswordLength caracteres';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: AppSpacing.lg),

                    const _Label('Confirmer le mot de passe'),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _confirm,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: const InputDecoration(
                        hintText: 'Repetez le mot de passe',
                        prefixIcon: Icon(Icons.lock_outline, size: 18, color: AppColors.inkDisabled),
                      ),
                      // Verification locale : l'API ne connait pas ce champ.
                      validator: (value) =>
                          value == _password.text ? null : 'Les mots de passe ne correspondent pas',
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
                          : const Text('Creer le compte'),
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
