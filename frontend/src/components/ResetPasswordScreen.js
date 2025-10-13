import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Loader2, Check, X, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/config.js';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../App.css';

const ResetPasswordScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const passwordRequirements = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSymbol: /[@$!%*?&]/.test(newPassword)
    };
  }, [newPassword]);

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordRequirements).every(req => req);
  }, [passwordRequirements]);

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    if (!token || !email) {
      setTokenValid(false);
      setIsVerifying(false);
      return;
    }

    try {
      const response = await authAPI.verifyResetToken(token, email);
      setTokenValid(response.valid);
    } catch (error) {
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      alert('La contraseña no cumple con todos los requisitos');
      return;
    }

    if (!passwordsMatch) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.resetPassword(token, email, newPassword);
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Enlace Inválido o Expirado</h1>
            <p className="text-gray-600">
              Este enlace de recuperación no es válido o ha expirado.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Contraseña Actualizada</h1>
            <p className="text-gray-600 mb-4">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            <p className="text-sm text-gray-500">
              Serás redirigido al login en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-10 h-10 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Nueva Contraseña</h1>
          <p className="text-gray-600 text-sm">Para: {email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo 8 caracteres"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {(showPasswordRequirements || newPassword.length > 0) && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <p className="text-xs font-medium text-gray-700 mb-2">Requisitos:</p>
                {Object.entries(passwordRequirements).map(([key, value]) => (
                  <div key={key} className="flex items-center text-xs">
                    {value ? (
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={value ? 'text-green-700' : 'text-gray-600'}>
                      {key === 'minLength' && 'Mínimo 8 caracteres'}
                      {key === 'hasUppercase' && 'Una letra mayúscula'}
                      {key === 'hasLowercase' && 'Una letra minúscula'}
                      {key === 'hasNumber' && 'Un número'}
                      {key === 'hasSymbol' && 'Un símbolo (@$!%*?&)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Repite tu contraseña"
              required
              disabled={isLoading}
            />
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-2 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </p>
            )}
          </div>

          <button
            onClick={handleResetPassword}
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              'Actualizar Contraseña'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
