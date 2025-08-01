import * as React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { Tailwind } from '@react-email/components';

interface NewDeviceLoginProps {
  name?: string;
  deviceName?: string;
  loginDate?: string;
  location?: string;
  passwordResetUrl?: string;
  deviceId?: string;
}

export function NewDeviceLogin({
  name = 'Investisseur',
  deviceName = 'Appareil inconnu',
  loginDate = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  location = 'Non disponible',
  passwordResetUrl = 'https://cashflowradar.fr/reset-password',
  deviceId = 'Non identifié',
}: NewDeviceLoginProps) {
  return (
    <html>
      <head>
        <title>Alerte de sécurité : Connexion depuis un nouvel appareil</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
              Alerte de sécurité 🔒
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Bonjour {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              Nous avons détecté une connexion à votre compte <span className="text-[#02153A] font-semibold">Cash Flow Radar</span> depuis un nouvel appareil.
            </p>
            
            <p className="text-gray-700 text-base mb-4">
              Si vous êtes à l'origine de cette connexion, aucune action n'est nécessaire. Cependant, si vous ne reconnaissez pas cet appareil, nous vous conseillons de <span className="font-bold">changer immédiatement votre mot de passe</span> pour protéger votre compte.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-md my-6 border-l-4 border-l-amber-500">
              <p className="text-gray-700 font-semibold text-base mb-3">
                Voici les détails de la connexion :
              </p>
              
              <ul className="list-none pl-0 m-0">
                <li className="text-gray-700 text-sm mb-2">
                  <span className="font-bold">Appareil :</span> {deviceName}
                </li>
                <li className="text-gray-700 text-sm mb-2">
                  <span className="font-bold">Date et heure :</span> {loginDate}
                </li>
                <li className="text-gray-700 text-sm mb-2">
                  <span className="font-bold">Localisation approximative :</span> {location || 'Non disponible'}
                </li>
                <li className="text-gray-700 text-sm mb-0">
                  <span className="font-bold">ID appareil :</span> {deviceId}
                </li>
              </ul>
            </div>
            
            <p className="text-gray-700 text-base mb-6">
              Si vous avez des questions ou si vous pensez que votre compte a été compromis, n'hésitez pas à nous contacter. Nous sommes là pour vous aider !
            </p>
            
            <div className="text-center my-8">
              <Button href={passwordResetUrl} primary={true}>
                Modifier mon mot de passe
              </Button>
            </div>
            
            <p className="text-gray-800 text-base mb-0">
              À bientôt, <br />
              <span className="font-bold">L'équipe Cash Flow Radar</span>
            </p>
          </Card>
          
          <Footer
            companyName="Cash Flow Radar"
            contactEmail="contact@cashflowradar.fr"
            recipientName={name}
            address="34 Avenue des Champs Élysées, 75008 Paris, France" 
            phone="0612345678"
            year={2025}
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