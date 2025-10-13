import React, { useState, useMemo } from 'react';
import { Shield, LogIn, UserPlus, Loader2, Check, X, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../api/config.js';
import '../App.css';

const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Validación de requisitos de contraseña
  const passwordRequirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[@$!%*?&]/.test(password)
    };
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(req => req);
  }, [passwordRequirements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      if (!isLogin && !isPasswordValid) {
        alert('La contraseña no cumple con todos los requisitos de seguridad');
        return;
      }

      try {
        setIsLoading(true);
        let response;
        if (isLogin) {
          response = await authAPI.login({ email: email.trim(), password });
        } else {
          response = await authAPI.register({
            email: email.trim(),
            password,
            plan: 'free'
          });
        }
        localStorage.setItem('webshield_token', response.token);
        onLogin(response.user);
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      alert('Por favor ingresa tu email');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.forgotPassword(forgotPasswordEmail.trim());
      setResetEmailSent(true);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setForgotPasswordEmail('');
  };

  // Pantalla de recuperación de contraseña
  if (showForgotPassword) {
    return (
      <div className="login-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="login-form bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="login-logo flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">
                {resetEmailSent ? 'Email Enviado' : 'Recuperar Contraseña'}
              </h1>
            </div>
            <p className="text-gray-600 fade-in">
              {resetEmailSent
                ? 'Revisa tu correo electrónico'
                : 'Te enviaremos un enlace de recuperación'
              }
            </p>
          </div>

          {resetEmailSent ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Email enviado exitosamente
                    </p>
                    <p className="text-xs text-green-700">
                      Hemos enviado un enlace de recuperación a <strong>{forgotPasswordEmail}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Próximos pasos:
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Revisa tu bandeja de entrada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Si no lo ves, revisa spam o correo no deseado</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>El enlace expirará en 1 hora</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleBackToLogin}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Login
              </button>
            </div>
          ) : (
            <div>
              <div className="slide-up mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de tu cuenta
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="login-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Introduce el email asociado a tu cuenta de WebShield
                </p>
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Enviar Enlace de Recuperación</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors flex items-center justify-center mx-auto"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver al Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  // Pantalla principal de login/registro
  return (
    <div className="login-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="login-form bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="login-logo flex items-center justify-center mb-4">
            <Shield className="login-shield w-10 h-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">WebShield</h1>
          </div>
          <p className="text-gray-600 fade-in">Constructor web seguro para tu negocio</p>
        </div>

        <div className="space-y-4">
          <div className="slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="slide-up" style={{ animationDelay: '0.3s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => !isLogin && setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
              className="login-input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mínimo 8 caracteres"
              required
              minLength="8"
              disabled={isLoading}
            />

            {!isLogin && (showPasswordRequirements || password.length > 0) && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>

                <div className="flex items-center text-xs">
                  {passwordRequirements.minLength ? (
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={passwordRequirements.minLength ? 'text-green-700' : 'text-gray-600'}>
                    Mínimo 8 caracteres
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {passwordRequirements.hasUppercase ? (
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={passwordRequirements.hasUppercase ? 'text-green-700' : 'text-gray-600'}>
                    Una letra mayúscula
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {passwordRequirements.hasLowercase ? (
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={passwordRequirements.hasLowercase ? 'text-green-700' : 'text-gray-600'}>
                    Una letra minúscula
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {passwordRequirements.hasNumber ? (
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={passwordRequirements.hasNumber ? 'text-green-700' : 'text-gray-600'}>
                    Un número
                  </span>
                </div>

                <div className="flex items-center text-xs">
                  {passwordRequirements.hasSymbol ? (
                    <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  )}
                  <span className={passwordRequirements.hasSymbol ? 'text-green-700' : 'text-gray-600'}>
                    Un símbolo (@$!%*?&)
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || (!isLogin && !isPasswordValid && password.length > 0)}
            className="login-button w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ animationDelay: '0.4s' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                <span>Iniciar Sesión</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Crear Cuenta</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 space-y-3 text-center fade-in" style={{ animationDelay: '0.5s' }}>
          {isLogin && (
            <div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="login-toggle text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {isLogin ? '¿No tienes cuenta? Crear una nueva' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
