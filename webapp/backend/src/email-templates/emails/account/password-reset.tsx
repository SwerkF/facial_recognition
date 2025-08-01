import * as React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { Tailwind } from '@react-email/components';

interface PasswordResetEmailProps {
  name?: string;
  resetUrl?: string;
}

export  function PasswordResetEmail({
  name = 'Utilisateur',
  resetUrl = 'https://cashflowradar.fr/reset-password',
}: PasswordResetEmailProps) {
  return (
    <html>
      <head>
        <title>Réinitialisation de votre mot de passe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
              Réinitialisation de mot de passe <span className="text-[#02153A]">requise</span> 🔐
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Bonjour {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Cash Flow Radar.
            </p>
            
            <p className="text-gray-700 text-base mb-6">
              Si vous êtes à l'origine de cette demande, veuillez cliquer sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expirera dans 24 heures.
            </p>
            
            <div className="text-center my-8">
              <Button href={resetUrl} primary={true}>
                Réinitialiser mon mot de passe
              </Button>
            </div>
            
            <p className="text-gray-700 text-base mb-4">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre compte reste sécurisé.
            </p>
            
            <p className="text-gray-800 text-base mb-0">
              En cas de besoin, n'hésitez pas à nous contacter. <br />
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