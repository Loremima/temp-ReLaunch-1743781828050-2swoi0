import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Save, Eye, EyeOff, Mail, Send, Loader2, Check, ExternalLink } from 'lucide-react';
import { useProspects } from '../../hooks';

// --- Définitions au niveau du module ---

// Liste des domaines d'email autorisés pour MailerSend (peut être déplacé dans un fichier de constantes)
export const MAILERSEND_AUTHORIZED_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];

interface Settings {
  email_provider: 'sendgrid' | 'mailersend';
  email_api_key: string | null;
}

interface Template {
  id: string;
  subject: string;
  body: string;
}

// Fonction utilitaire pour générer le payload d'email selon le fournisseur
const createEmailPayload = (provider: string, apiKey: string, recipient: any, subject: string, htmlContent: string, realData: any) => {
  const basePayload = {
    email_provider: provider,
    email_api_key: apiKey,
    to: recipient.email,
    subject: subject,
    html: htmlContent,
    name: realData.name,
    project: realData.project,
    company: realData.company
  };

  if (provider === 'mailersend') {
    // MailerSend nécessite une structure spécifique
    return {
      ...basePayload,
      from: {
        email: "info@trial-r9084zvr6jegw63d.mlsender.net", // Doit correspondre à un domaine vérifié
        name: "ReLaunch App"
      },
      recipients: [
        {
          email: recipient.email,
          name: recipient.name || recipient.email.split('@')[0]
        }
      ]
      // 'to', 'subject', 'html' sont aussi inclus via ...basePayload
    };
  }
  // SendGrid utilise une structure plus simple
  return basePayload;
};

// --- Composant React ---

export default function EmailSettings() {
  const { user } = useAuth();
  const { prospects, fetchProspects } = useProspects();
  const [settings, setSettings] = useState<Settings>({
    email_provider: 'sendgrid',
    email_api_key: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailsSent, setEmailsSent] = useState<number>(0);
  const [emailsTotal, setEmailsTotal] = useState<number>(0);
  const [sendToAll, setSendToAll] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchProspects();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key')
        .eq('user_id', user?.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setSettings({
          email_provider: data.email_provider,
          email_api_key: data.email_api_key
        });
      }
    } catch (error: any) {
      setError('Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('settings')
        .update({
          email_provider: settings.email_provider,
          email_api_key: settings.email_api_key
        })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;
    } catch (error: any) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Fonction unifiée d'envoi d'emails
  const sendEmails = async () => {
    setEmailStatus('sending');
    setError(null);
    setEmailsSent(0);
    setEmailsTotal(0);

    try {
      // 1. Récupérer le premier template de l'utilisateur
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('id, subject, body')
        .eq('user_id', user?.id)
        .order('stage', { ascending: true })
        .limit(1)
        .single<Template>();

      if (templateError || !templateData) {
        throw new Error('Aucun template trouvé. Veuillez créer un template avant d\'envoyer des emails.');
      }

      // Vérifier que nous avons une clé API
      if (!settings.email_api_key) {
        throw new Error('Veuillez entrer une clé API avant d\'envoyer des emails.');
      }

      // S'assurer que la session est valide
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Votre session a expiré. Veuillez rafraîchir la page et réessayer.');
      }

      // 2. Vérifier qu'il y a au moins un prospect disponible
      if (prospects.length === 0) {
        throw new Error('Aucun prospect trouvé. Veuillez ajouter au moins un prospect.');
      }

      // Filtrer les prospects valides (avec email et nom)
      const validProspects = prospects.filter(p => p.email && p.name);

      if (validProspects.length === 0) {
        throw new Error('Aucun prospect valide trouvé. Veuillez ajouter des prospects avec nom et email.');
      }

      // Déterminer si on envoie à un seul prospect ou à tous
      const prospectsToProcess = sendToAll
        ? validProspects
        : [validProspects.find(p => p.email && p.name && p.project) || validProspects[0]];

      setEmailsTotal(prospectsToProcess.length);

      console.log(`Envoi d'emails à ${prospectsToProcess.length} prospect(s)`);

      // Traiter chaque prospect
      const results = [];
      for (const prospect of prospectsToProcess) {
        try {
          console.log(`Préparation de l'email pour: ${prospect.email}`);

          const realData = {
            name: prospect.name,
            project: prospect.project || 'N/A',
            company: prospect.company || 'N/A'
          };

          let subject = templateData.subject;
          let body = templateData.body;

          // Remplacer les variables dans le sujet et le corps
          Object.entries(realData).forEach(([key, value]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            subject = subject.replace(regex, value);
            body = body.replace(regex, value);
          });

          // Vérification du domaine d'email pour MailerSend
          if (settings.email_provider === 'mailersend') {
            const domain = prospect.email.split('@')[1];
            const isDomainAuthorized = MAILERSEND_AUTHORIZED_DOMAINS.includes(domain);

            if (!isDomainAuthorized) {
              console.warn(`Le domaine d'email ${domain} n'est pas supporté par MailerSend.`);
              results.push({
                prospect,
                success: false,
                error: `Le domaine ${domain} n'est pas supporté par MailerSend`
              });
              continue; // Passer au prospect suivant
            }
          }

          // Simplifier le payload pour éviter les problèmes
          const basePayload = {
            email_provider: settings.email_provider,
            email_api_key: settings.email_api_key,
            to: prospect.email,
            subject: subject,
            html: body,
            // Propriétés spécifiques à MailerSend
            ...(settings.email_provider === 'mailersend' ? {
              from: {
                email: "info@trial-r9084zvr6jegw63d.mlsender.net",
                name: "ReLaunch App"
              },
              recipients: [{
                email: prospect.email,
                name: prospect.name
              }]
            } : {})
          };

          console.log(`Envoi du payload pour ${prospect.email}:`, JSON.stringify(basePayload));

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-direct`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                ...basePayload,
                prospect_id: prospect.id,
                template_id: templateData.id,
                user_id: user?.id
              })
            }
          );

          console.log(`Réponse pour ${prospect.email}:`, response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Erreur HTTP ${response.status}` }));
            console.error("Détails de l'erreur:", errorData);
            results.push({
              prospect,
              success: false,
              error: errorData.error || `Erreur d'envoi (${response.status})`
            });
          } else {
            results.push({ prospect, success: true });
            setEmailsSent(prev => prev + 1);
          }
        } catch (error: any) {
          console.error(`Erreur lors de l'envoi à ${prospect.email}:`, error);
          results.push({
            prospect,
            success: false,
            error: error.message || 'Erreur inconnue'
          });
        }
      }

      // Vérifier les résultats
      const failedEmails = results.filter(r => !r.success);

      if (failedEmails.length > 0 && emailsSent === 0) {
        throw new Error(`Aucun email envoyé. ${failedEmails.length} échec(s).`);
      } else if (failedEmails.length > 0) {
        setError(`${emailsSent} email(s) envoyé(s), ${failedEmails.length} échec(s).`);
        setEmailStatus('error');
      } else {
        setEmailStatus('success');
      }

      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (error: any) {
      setEmailStatus('error');
      setError(`Échec: ${error.message || 'Erreur inconnue'}`);
      setTimeout(() => setEmailStatus('idle'), 5000);
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
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Email Provider Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Configure your email service provider for sending follow-ups</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center bg-red-50 text-red-600 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Provider
            </label>
            <select
              value={settings.email_provider}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email_provider: e.target.value as 'sendgrid' | 'mailersend'
              }))}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailersend">MailerSend</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.email_api_key || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, email_api_key: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={`Enter your ${settings.email_provider} API key`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showApiKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-2 mb-3">
              <button
                onClick={() => setSendToAll(!sendToAll)}
                className="flex items-center focus:outline-none"
              >
                <div className={`w-4 h-4 mr-2 border rounded ${sendToAll ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                  {sendToAll && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-gray-700">Envoyer à tous les prospects ({prospects.length})</span>
              </button>
            </div>

            <button
              onClick={sendEmails}
              disabled={!settings.email_api_key || emailStatus === 'sending'}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${!settings.email_api_key || emailStatus === 'sending'
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : emailStatus === 'success'
                  ? 'bg-green-50 text-green-700 cursor-default'
                  : emailStatus === 'error'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : sendToAll
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
            >
              {emailStatus === 'sending' ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {sendToAll ? `Envoi en cours... ${emailsSent}/${emailsTotal}` : 'Envoi en cours...'}
                </>
              ) : emailStatus === 'success' ? (
                <>
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  {emailsSent > 1 ? `${emailsSent} emails envoyés` : 'Email envoyé'}
                </>
              ) : emailStatus === 'error' ? (
                <>
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Réessayer
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  {sendToAll ? `Envoyer à tous (${prospects.length})` : 'Envoyer un test'}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              {sendToAll
                ? `Envoie un email à tous vos prospects en utilisant votre premier template.`
                : `Envoie un email de test à un prospect en utilisant votre premier template.`
              }
              {settings.email_provider === 'mailersend' && ' Attention: MailerSend ne fonctionne qu\'avec certains domaines (gmail.com, outlook.com, etc.).'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Provider Documentation</h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <img src="https://www.google.com/s2/favicons?domain=sendgrid.com&sz=32" alt="SendGrid" className="w-5 h-5 mr-2" />
              SendGrid Setup
            </h4>
            <ol className="space-y-3 list-decimal list-inside text-gray-600">
              <li>
                <a
                  href="https://signup.sendgrid.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  Create a SendGrid account
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                </a>
              </li>
              <li>Verify your sending domain</li>
              <li>Create an API key with "Mail Send" permissions</li>
              <li>Copy the API key and paste it above</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <img src="https://www.google.com/s2/favicons?domain=mailersend.com&sz=32" alt="MailerSend" className="w-5 h-5 mr-2" />
              MailerSend Setup
            </h4>
            <ol className="space-y-3 list-decimal list-inside text-gray-600">
              <li>
                <a
                  href="https://www.mailersend.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                >
                  Create a MailerSend account
                  <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
                </a>
              </li>
              <li>Add and verify your domain</li>
              <li>Generate an API token</li>
              <li>Copy the token and paste it above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}