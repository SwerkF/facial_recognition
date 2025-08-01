import * as React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { Tailwind } from '@react-email/components';

interface PasswordChangedEmailProps {
  name?: string;
  loginUrl?: string;
}

export default function PasswordChangedEmail({
  name = 'Utilisateur',
  loginUrl = 'https://cashflowradar.fr/login',
}: PasswordChangedEmailProps) {
  return (
    <html>
      <head>
        <title>Votre mot de passe a été mis à jour</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
              Mot de passe <span className="text-[#02153A]">mis à jour</span> ✅
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Bonjour {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              C'est fait ! Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec vos nouvelles informations et reprendre le contrôle de vos investissements.
            </p>
            
            <div className="text-center my-8">
              <Button href={loginUrl} primary={true}>
                Se connecter
              </Button>
            </div>
            
            <p className="text-gray-700 text-base mb-5">
              <span className="font-semibold text-gray-800">Information de sécurité importante :</span> Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement à <a href="mailto:support@cashflowradar.fr" className="text-blue-600 hover:underline">support@cashflowradar.fr</a>.
            </p>
            
            <p className="text-gray-800 text-base mb-0">
              À très vite sur Cash Flow Radar ! <br />
              <span className='font-bold'>L'équipe Cash Flow Radar</span>
            </p>
          </Card>
          
          <Footer
            companyName="Cash Flow Radar"
            contactEmail="contact@cashflowradar.fr"
            recipientName={name}
            socialLinks={[
              {
                href: 'https://instagram.com/cashflowradar',
                icon: <span>📷</span>,
                alt: 'Instagram'
              },
              {
                href: 'https://linkedin.com/company/cashflowradar',
                icon: <span>📱</span>,
                alt: 'LinkedIn'
              },
              {
                href: 'https://cashflowradar.fr',
                icon: <span>🌐</span>,
                alt: 'Website'
              },
            ]}
          />
        </body>
      </Tailwind>
    </html>
  );
} 