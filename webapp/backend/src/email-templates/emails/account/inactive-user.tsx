import * as React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { Tailwind } from '@react-email/components';

interface InactiveUserEmailProps {
  name?: string;
  dashboardUrl?: string;
}

export default function InactiveUserEmail({
  name = 'Investisseur',
  dashboardUrl = 'https://cashflowradar.fr/dashboard',
}: InactiveUserEmailProps) {
  return (
    <html>
      <head>
        <title>On a remarqué que vous ne vous êtes pas connecté depuis un moment...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-left">
              Prêt à reprendre votre recherche d'<span className="text-[#02153A]">investissements</span> ? 🚀
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Salut {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              Cela fait un petit moment que vous n'êtes pas passé par Cash Flow Radar. Nous espérons que tout va bien de votre côté !
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              Les opportunités immobilières n'attendent pas, et nous avons encore beaucoup de biens intéressants qui pourraient correspondre à vos critères. Il est temps de reprendre le contrôle et de relancer vos recherches !
            </p>
            
            <p className="text-gray-700 text-base mb-6">
              Il vous suffit de vous reconnecter à votre compte pour voir tout cela.
            </p>
            
            <div className="text-center my-8">
              <Button href={dashboardUrl} primary={true}>
                Revenir sur mon tableau de bord
              </Button>
            </div>
            
            <p className="text-gray-700 text-base mb-2">
              On vous attend pour repartir à la conquête de rentabilité !
            </p>
            
            <p className="text-gray-800 text-base mb-0">
              À bientôt, <br />
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