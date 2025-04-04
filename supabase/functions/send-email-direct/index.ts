import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MailerSend, EmailParams } from "npm:mailersend@2.2.0";
import SendGrid from "npm:@sendgrid/mail@8.1.1";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2D3748;
      margin: 0;
      padding: 0;
      background-color: #F7FAFC;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-content {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #4A5568;
    }
    .logo-text span {
      color: #4299E1;
    }
    .card {
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 32px;
      margin-bottom: 30px;
    }
    .content {
      color: #4A5568;
      font-size: 16px;
      line-height: 1.8;
    }
    .signature {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #E2E8F0;
      color: #718096;
      font-style: italic;
    }
    .footer {
      text-align: center;
      color: #A0AEC0;
      font-size: 12px;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(to right, #4299E1, #667EEA);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 24px 0;
    }
    .button:hover {
      background: linear-gradient(to right, #3182CE, #5A67D8);
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }
      .card {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-content">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6V21H11V6H13Z" fill="#4299E1"/>
          <path d="M22.8776 9.5C22.7609 9.18138 22.5171 8.93759 22.2076 8.84812L16.8076 7.34812C16.5804 7.28198 16.3391 7.28925 16.1161 7.36903C15.8931 7.44881 15.7007 7.59721 15.5676 7.79812L11.9976 13.0881L8.42762 7.79812C8.29459 7.59721 8.10221 7.44881 7.87919 7.36903C7.65616 7.28925 7.41488 7.28198 7.18762 7.34812L1.78762 8.84812C1.47813 8.93759 1.23438 9.18138 1.11762 9.5C1.00087 9.81863 1.02091 10.1738 1.17262 10.4781L5.67262 18.4781C5.81196 18.756 6.05415 18.9675 6.34761 19.0617C6.64107 19.156 6.96219 19.1249 7.23762 18.9781C7.51305 18.8314 7.71772 18.5824 7.80262 18.2881L8.99762 14.4981L11.5776 18.2081C11.7066 18.3922 11.8863 18.5358 12.0938 18.6217C12.3014 18.7075 12.5284 18.7321 12.7484 18.6926C12.9683 18.653 13.1718 18.5509 13.3347 18.3978C13.4976 18.2447 13.6136 18.0468 13.6701 17.8287C13.7266 17.6106 13.7212 17.3816 13.6544 17.1664C13.5876 16.9512 13.4621 16.7591 13.2917 16.613C13.1213 16.4669 12.9125 16.3726 12.6906 16.3404C12.4687 16.3082 12.2427 16.3394 12.0376 16.4312L11.9976 16.4481L9.41762 12.7381L11.9976 8.91813L14.5776 12.7381L12.0076 16.4312L11.9676 16.4081C11.7624 16.3172 11.5366 16.2867 11.3148 16.3195C11.0931 16.3523 10.8845 16.447 10.7143 16.5934C10.5442 16.7397 10.4189 16.9319 10.3523 17.1471C10.2857 17.3623 10.2805 17.5912 10.3371 17.8092C10.3937 18.0272 10.5098 18.2249 10.6726 18.378C10.8355 18.531 11.039 18.633 11.2588 18.6726C11.4787 18.7121 11.7056 18.6876 11.9132 18.6018C12.1207 18.516 12.3004 18.3725 12.4294 18.1885L15.0076 14.4781L16.1976 18.2681C16.2825 18.5624 16.4872 18.8114 16.7626 18.9581C17.038 19.1049 17.3591 19.136 17.6526 19.0417C17.946 18.9475 18.1882 18.7356 18.3276 18.4581L22.8276 10.4581C22.9793 10.1538 22.9944 9.79863 22.8776 9.5Z" fill="#4299E1"/>
        </svg>
        <div class="logo-text">
          <span>Re</span>Launch
        </div>
      </div>
    </div>
    <div class="card">
      <div class="content">
        {content}
      </div>
      <div class="signature">
        Best regards,<br>
        The ReLaunch Team
      </div>
    </div>
    <div class="footer">
      <p>This email was sent automatically from the ReLaunch platform.</p>
      <p>© {year} ReLaunch. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      email_provider, 
      email_api_key, 
      to,
      name,
      subject: rawSubject, 
      html: rawHtml, 
      prospect_id, 
      template_id, 
      user_id,
      project,
      company 
    } = body;

    if (!email_provider) throw new Error('Email provider is required');
    if (!email_api_key) throw new Error('API key is required');
    if (!rawSubject) throw new Error('Subject is required');
    if (!rawHtml) throw new Error('HTML content is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Utiliser l'adresse email fournie dans la requête
    const recipientEmail = to;
    
    // Log détaillé des données utilisées pour l'envoi
    console.log('Sending email with the following data:');
    console.log('- Recipient:', recipientEmail);
    console.log('- Name:', name || 'there');
    console.log('- Project:', project || 'your project');
    console.log('- Company:', company || 'your company');
    console.log('- Email Provider:', email_provider);
    
    // Make replacements case-insensitive with global flag
    const nameValue = name || 'there';
    const projectValue = project || 'your project';
    const companyValue = company || 'your company';
    
    // Replace placeholders in subject and HTML content with case-insensitive global replacements
    const subject = rawSubject
      .replace(/{name}/gi, nameValue)
      .replace(/{project}/gi, projectValue)
      .replace(/{company}/gi, companyValue);

    console.log('- Subject after replacement:', subject);

    const processedHtml = rawHtml
      .replace(/{name}/gi, nameValue)
      .replace(/{project}/gi, projectValue)
      .replace(/{company}/gi, companyValue);

    // Insert processed HTML into email template
    const formattedHtml = emailTemplate
      .replace('{content}', processedHtml)
      .replace('{year}', new Date().getFullYear().toString());

    try {
      if (email_provider === 'sendgrid') {
        console.log('Using SendGrid to send email...');
        SendGrid.setApiKey(email_api_key);
        await SendGrid.send({
          to: recipientEmail,
          from: 'info@trial-r9084zvr6jegw63d.mlsender.net',
          subject,
          html: formattedHtml
        });
        console.log('Email successfully sent via SendGrid');
      } else if (email_provider === 'mailersend') {
        console.log('Using MailerSend to send email...');
        console.log('Détails de la requête MailerSend:');
        console.log('- API Key (premiers chars):', email_api_key.substring(0, 10) + '...');
        console.log('- Email destinataire:', recipientEmail);
        
        try {
          // Créer l'instance MailerSend
          const mailerSend = new MailerSend({
            apiKey: email_api_key
          });
          
          // Extraire le nom du destinataire si disponible
          const recipientName = nameValue || recipientEmail.split('@')[0];
          
          console.log('- Nom du destinataire:', recipientName);
          
          // Construire les paramètres d'email avec une approche plus robuste
          const emailParams = new EmailParams();
          
          // Définir l'expéditeur
          emailParams.setFrom({
            email: 'info@trial-r9084zvr6jegw63d.mlsender.net',
            name: 'ReLaunch App'
          });
          
          // Définir le destinataire
          emailParams.setTo([
            {
              email: recipientEmail,
              name: recipientName
            }
          ]);
          
          // Définir le sujet
          emailParams.setSubject(subject);
          
          // Définir le contenu HTML
          emailParams.setHtml(formattedHtml);
          
          console.log('EmailParams configuré:', JSON.stringify({
            from: {
              email: 'info@trial-r9084zvr6jegw63d.mlsender.net',
              name: 'ReLaunch App'
            },
            to: [
              {
                email: recipientEmail,
                name: recipientName
              }
            ],
            subject: subject
          }));
          
          console.log('Tentative d\'envoi d\'email...');
          
          // Envoyer l'email
          const mailResponse = await mailerSend.email.send(emailParams);
          console.log('Réponse MailerSend:', JSON.stringify(mailResponse));
          console.log('Email successfully sent via MailerSend');
        } catch (mailError) {
          console.error('Erreur spécifique MailerSend:', mailError);
          console.error('Type d\'erreur:', typeof mailError);
          
          if (mailError instanceof Error) {
            console.error('Message d\'erreur:', mailError.message);
            console.error('Stack:', mailError.stack);
          } else {
            console.error('Erreur non standard:', JSON.stringify(mailError));
          }
          
          throw new Error(`Erreur MailerSend: ${mailError.message || JSON.stringify(mailError)}`);
        }
      } else {
        throw new Error('Invalid email provider');
      }

      // Log to history if prospect_id is provided
      if (prospect_id && user_id) {
        console.log('Logging to history for prospect_id:', prospect_id);
        await supabase
          .from('history')
          .insert({
            prospect_id,
            template_id,
            user_id,
            status: 'Sent',
            sent_at: new Date().toISOString()
          });
        console.log('History entry created successfully');
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        recipient: recipientEmail,
        name: nameValue,
        project: projectValue,
        company: companyValue
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Erreur complète dans l\'envoi d\'email:');
      console.error('- Type d\'erreur:', typeof error);
      console.error('- Message d\'erreur:', error.message);
      console.error('- Stack trace:', error.stack);
      
      if (error.response) {
        console.error('- Données de réponse:', JSON.stringify(error.response));
      }
      
      if (error.body) {
        console.error('- Corps de l\'erreur:', JSON.stringify(error.body));
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: `Failed to send email: ${error.message}`,
        details: JSON.stringify(error)
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to process request'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});