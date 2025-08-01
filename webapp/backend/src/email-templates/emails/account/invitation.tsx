import * as React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { Tailwind } from '@react-email/components';

interface InvitationEmailProps {
  name?: string;
  invitedBy?: string;
  joinUrl?: string;
}

export default function InvitationEmail({
  name = 'Investisseur',
  invitedBy = 'Intel',
  joinUrl = 'https://cashflowradar.fr/join',
}: InvitationEmailProps) {
  return (
    <html>
      <head>
        <title>Intel vous invite à rejoindre Cash Flow Radar 🚀</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
              <span className="text-[#02153A]">{invitedBy}</span> vous invite à rejoindre Cash Flow Radar 🚀
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Bonjour {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              {invitedBy} vous invite à rejoindre <strong>Cash Flow Radar</strong>, la plateforme pour découvrir des opportunités immobilières à haut rendement.
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              <strong>Analysez</strong> les biens en temps réel.
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              <strong>Comparez</strong> les annonces et calculez rentabilité et cash flow.
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              <strong>Créez des alertes</strong> pour ne manquer aucune opportunité.
            </p>
            
            <div className="text-center my-8">
              <Button href={joinUrl} primary={true}>
                Rejoindre Cash Flow Radar
              </Button>
            </div>
            
            <p className="text-gray-700 text-base mb-4">
              Ne manquez pas cette chance de maximiser vos investissements !
            </p>
            
            <p className="text-gray-800 text-base mb-0">
              À très vite, <br />
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