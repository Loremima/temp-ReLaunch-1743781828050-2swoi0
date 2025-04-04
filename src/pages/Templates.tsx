import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Check, AlertCircle, Mail, Loader2, Send, Users, Trash2 } from 'lucide-react';
import TemplateCard from '../components/emails/TemplateCard';
import TemplateForm from '../components/emails/TemplateForm';
import { TemplateFormData } from '../components/emails/TemplateForm';

interface Template {
  id: string;
  stage: number;
  name: string;
  subject: string;
  body: string;
}

function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testingTemplateId, setTestingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user?.id)
        .order('stage', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setEditingId(id);
    }
  };

  const handleSave = async (formData: TemplateFormData) => {
    try {
      setError(null);

      if (editingId && editingId !== 'new') {
        const { error } = await supabase
          .from('templates')
          .update({
            name: formData.name,
            subject: formData.subject,
            body: formData.body,
            stage: formData.stage
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('templates')
          .insert({
            user_id: user?.id,
            name: formData.name || `Stage ${formData.stage} Template`,
            subject: formData.subject,
            body: formData.body,
            stage: formData.stage
          });

        if (error) throw error;
      }

      await fetchTemplates();
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving template:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
    }
  };

  const handleTestEmail = async (template: Template) => {
    setTestEmailStatus('sending');
    setTestingTemplateId(template.id);
    setError(null);

    try {
      // Récupérer les prospects
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user?.id);

      console.log("Résultat de la requête prospects:", {
        count: prospects?.length || 0,
        data: prospects,
        error: prospectsError
      });

      if (prospectsError) throw prospectsError;

      if (prospects.length === 0) {
        throw new Error('No prospects found. Please add prospects first.');
      }

      // Récupérer les paramètres d'email
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (settingsError) throw settingsError;

      // Envoyer un email de test
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email_provider: settings.email_provider,
            email_api_key: settings.email_api_key,
            to: user?.email,
            subject: template.subject,
            html: template.body,
            template_id: template.id,
            user_id: user?.id
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test email');
      }

      setTestEmailStatus('success');
      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      setError(error.message);
      setTestEmailStatus('error');
      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    }
  };

  const handleTestAllProspects = async (template: Template) => {
    setTestEmailStatus('sending');
    setTestingTemplateId(template.id);
    setError(null);

    try {
      // Récupérer les prospects
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', user?.id);

      console.log("Résultat de la requête prospects:", {
        count: prospects?.length || 0,
        data: prospects,
        error: prospectsError
      });

      if (prospectsError) throw prospectsError;

      if (prospects.length === 0) {
        throw new Error('No prospects found. Please add prospects first.');
      }

      // Log tous les prospects pour débogage
      console.log("Liste complète des prospects:", prospects.map(p => ({ name: p.name, email: p.email })));

      // Récupérer les paramètres d'email
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (settingsError) throw settingsError;

      // Envoyer un email à chaque prospect
      const results = await Promise.all(
        prospects.map(async (prospect) => {
          try {
            // Log avant envoi pour vérifier l'adresse exacte
            console.log(`Tentative d'envoi à: ${prospect.name} (${prospect.email})`);

            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email_provider: settings.email_provider,
                  email_api_key: settings.email_api_key,
                  to: prospect.email,
                  name: prospect.name,
                  project: prospect.project || 'your project',
                  company: prospect.company || 'your company',
                  subject: template.subject,
                  html: template.body,
                  prospect_id: prospect.id,
                  template_id: template.id,
                  user_id: user?.id
                })
              }
            );

            // Log la réponse pour voir si tout s'est bien passé
            const responseData = await response.json();
            console.log(`Réponse pour ${prospect.email}:`, responseData);

            if (!response.ok) {
              throw new Error(responseData.error || 'Failed to send email');
            }

            return { success: true, prospect: prospect.email };
          } catch (error: any) {
            console.error(`Error sending to ${prospect.email}:`, error);
            return { success: false, prospect: prospect.email, error: error.message };
          }
        })
      );

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (failed > 0) {
        setError(`Sent to ${successful} prospects, failed for ${failed} prospects.`);
        setTestEmailStatus('error');
      } else {
        setTestEmailStatus('success');
      }

      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error sending test emails:', error);
      setError(error.message);
      setTestEmailStatus('error');
      setTimeout(() => {
        setTestEmailStatus('idle');
        setTestingTemplateId(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your follow-up email templates
          </p>
        </div>
        <button
          onClick={() => setEditingId('new')}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      {error && (
        <div className={`mb-4 flex items-center p-4 rounded-lg ${error.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
          {error.includes('success') ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Formulaire de création */}
        {editingId === 'new' && (
          <TemplateForm
            isNew={true}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        )}

        {/* Cartes de templates - affichage ou édition */}
        {templates.map((template) => (
          editingId === template.id ? (
            <TemplateForm
              key={template.id}
              isNew={false}
              initialData={{
                name: template.name,
                stage: template.stage,
                subject: template.subject,
                body: template.body
              }}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendTest={handleTestEmail}
              isSendingTest={testEmailStatus === 'sending' && testingTemplateId === template.id}
              testStatus={testingTemplateId === template.id ? testEmailStatus : 'idle'}
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTestEmail(template)}
                  disabled={testEmailStatus === 'sending'}
                  className={`text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors ${testingTemplateId === template.id && testEmailStatus === 'sending'
                    ? 'bg-blue-400 cursor-not-allowed'
                    : testingTemplateId === template.id && testEmailStatus === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : testingTemplateId === template.id && testEmailStatus === 'error'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  {testingTemplateId === template.id && testEmailStatus === 'sending' ? (
                    <>
                      <Loader2 className="animate-spin w-3 h-3 mr-1" />
                      Sending...
                    </>
                  ) : testingTemplateId === template.id && testEmailStatus === 'success' ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Sent
                    </>
                  ) : testingTemplateId === template.id && testEmailStatus === 'error' ? (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Test
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleTestAllProspects(template)}
                  disabled={testEmailStatus === 'sending'}
                  className={`text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors ${testEmailStatus === 'sending'
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                >
                  <Users className="w-3 h-3 mr-1" />
                  Test all
                </button>

                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </TemplateCard>
          )
        ))}

        {/* État vide - pas de templates */}
        {templates.length === 0 && !loading && (
          <div className="bg-white shadow-md rounded-xl p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first email template to start following up with prospects
            </p>
            <button
              onClick={() => setEditingId('new')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Templates;