import * as React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { Tailwind } from '@react-email/components';

interface RemindEmailProps {
  name?: string;
  confirmationUrl?: string;
}

export default function RemindEmail({
  name = 'Investisseur',
  confirmationUrl = 'https://cashflowradar.fr/confirm',
}: RemindEmailProps) {
  return (
    <html>
      <head>
        <title>Vous êtes à deux clics de la rentabilité 💸</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
              Vous êtes à deux clics de la <span className="text-[#02153A]">rentabilité</span> 💸
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Salut {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              On dirait que vous avez oublié de confirmer votre adresse email. Pas de panique, il est encore temps !
            </p>
            
            <p className="text-gray-700 text-base mb-6">
              Confirmer votre email, c'est la première étape pour accéder aux meilleures analyses immobilières et trouver des biens rentables en un clin d'œil.
            </p>
            
            <div className="text-center my-8">
              <Button href={confirmationUrl} primary={true}>
                Confirmer mon email
              </Button>
            </div>
            
            <p className="text-gray-800 text-base mb-0">
              On vous attend avec impatience, <br />
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