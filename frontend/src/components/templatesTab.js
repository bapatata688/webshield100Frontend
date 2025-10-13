import React, { useState, useEffect } from 'react';
import { Loader2, Layout, Clock, CheckCircle, Lock } from 'lucide-react';
import { templatesAPI } from '../api/config.js';

const TemplatesTab = ({ user, onProjectCreated, onNavigateToPlans }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesAPI.getAll();
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (templateId, templateName) => {
    const projectName = prompt(`Nombre del nuevo proyecto:`, templateName);
    if (!projectName) return;

    try {
      setCreating(templateId);
      const response = await templatesAPI.createFromTemplate(templateId, projectName);

      // Notificar al componente padre que se creó un proyecto
      if (onProjectCreated) {
        onProjectCreated(response.project);
      }

      alert(`✅ Proyecto "${projectName}" creado exitosamente desde plantilla`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setCreating(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'creative':
        return 'bg-purple-100 text-purple-800';
      case 'food':
        return 'bg-orange-100 text-orange-800';
      case 'blog':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando plantillas...</p>
      </div>
    );
  }

  // Plan restrictions
  const isPro = user?.plan === 'pro' || user?.plan === 'premium';
  const isPremium = user?.plan === 'premium';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Plantillas</h2>
        <p className="text-gray-600">Crea proyectos rápidamente con nuestras plantillas profesionales</p>
      </div>

      {/* Plan Warning for Free Users */}
      {user?.plan === 'free' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 animate-slide-up">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                Plantillas disponibles solo para planes Pro y Premium
              </h3>
              <p className="text-xs text-amber-700 mb-3">
                Actualiza tu plan para acceder a plantillas profesionales y acelerar tu trabajo
              </p>
              <button
                onClick={onNavigateToPlans}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 text-sm font-medium"
              >
                Ver Planes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hay plantillas disponibles</h3>
          <p className="text-gray-600">Las plantillas estarán disponibles pronto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => {
            const isLocked = !isPro;
            const isCreating = creating === template.id;

            return (
              <div
                key={template.id}
                className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-300 animate-slide-up ${isLocked
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-md hover:-translate-y-1'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Template Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Layout className="w-5 h-5 text-blue-600" />
                      {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                  </div>
                </div>

                {/* Template Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Template Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{template.estimated_time}</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>{template.elements?.length || 0} elementos incluidos</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => !isLocked && createFromTemplate(template.id, template.name)}
                  disabled={isLocked || isCreating}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${isLocked
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isCreating
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </span>
                  ) : isLocked ? (
                    'Requiere Plan Pro'
                  ) : (
                    'Usar Plantilla'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats for Premium Users */}
      {isPremium && (
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Estadísticas Premium
              </h3>
              <p className="text-sm text-gray-600">
                Accede a análisis avanzados de tus proyectos
              </p>
            </div>
            <button
              onClick={() => {
                // Aquí puedes agregar lógica para mostrar estadísticas
                alert('Función de estadísticas avanzadas próximamente');
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200"
            >
              Ver Estadísticas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesTab;
