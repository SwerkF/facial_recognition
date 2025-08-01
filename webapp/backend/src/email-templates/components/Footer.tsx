import * as React from 'react';

interface SocialLink {
  href: string;
  icon: React.ReactNode;
  alt: string;
}

interface FooterProps {
  companyName?: string;
  address?: string;
  contactEmail?: string;
  phone?: string;
  socialLinks?: SocialLink[];
  className?: string;
  year?: number;
  recipientName?: string;
}

// SVG icons pour les réseaux sociaux
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export const Footer: React.FC<FooterProps> = ({
  companyName = 'Cash Flow Radar',
  address = '34 Avenue des Champs Élysées, 75008 Paris, France',
  contactEmail = 'contact@cashflowradar.fr',
  phone = '0612345678',
  socialLinks = [
    {
      href: 'https://instagram.com',
      icon: <InstagramIcon />,
      alt: 'Instagram'
    },
    {
      href: 'https://linkedin.com',
      icon: <LinkedInIcon />,
      alt: 'LinkedIn'
    },
    {
      href: 'https://example.com',
      icon: <GlobeIcon />,
      alt: 'Website'
    },
  ],
  className = '',
  year = new Date().getFullYear(),
  recipientName = '[Prénom Nom]',
}) => {
  return (
    <table className="w-full mt-6 border-separate border-spacing-0">
      <tbody>
        <tr>
          <td className="text-center">
            <table className="mx-auto border-separate border-spacing-0">
              <tbody>
                <tr>
                  <td className="text-center pb-5">
                    <table className="mx-auto border-separate border-spacing-0">
                      <tbody>
                        <tr>
                          {socialLinks.map((link, index) => (
                            <td key={index} className="px-2.5">
                              <a 
                                href={link.href} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-block w-6 h-6 text-center no-underline text-black"
                              >
                                {link.icon}
                              </a>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <p className="text-xs text-gray-800 m-0 leading-5">
                      {companyName} · {address}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <p className="text-xs text-gray-800 m-0 leading-5">
                      {phone} · {contactEmail}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="text-center">
                    <p className="text-xs text-gray-800 m-0 leading-5">
                      ©{year} Tous droits réservés
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="text-center pt-4">
                    <p className="text-[9px] text-gray-500 leading-4 max-w-[420px] mx-auto">
                      Ce mail est destiné à {recipientName}. Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.
                      Si vous êtes préoccupé par la sécurité de vos données, veuillez répondre à cet e-mail pour nous contacter.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default Footer; 