import * as React from 'react';

declare global {
    // Surcharge pour éviter les conflits de types React
    namespace JSX {
        // Interface pour étendre ReactElement avec des types plus stricts
        interface Element
            extends React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>> {
            // Extension du type Element pour la compatibilité
        }
    }
}

// Déclarations de modules pour @react-email/components
declare module '@react-email/components' {
    export const Body: React.FC<React.HTMLAttributes<HTMLBodyElement>>;
    export const Container: React.FC<React.HTMLAttributes<HTMLTableElement>>;
    export const Head: React.FC<React.HTMLAttributes<HTMLHeadElement>>;
    export const Html: React.FC<React.HTMLAttributes<HTMLHtmlElement>>;
    export const Img: React.FC<React.ImgHTMLAttributes<HTMLImageElement>>;
    export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>>;
    export const Preview: React.FC<
        React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }
    >;
    export const Section: React.FC<React.HTMLAttributes<HTMLTableElement>>;
    export const Text: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;

    export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
        as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }
    export const Heading: React.FC<HeadingProps>;

    export interface TailwindProps {
        children: React.ReactNode;
        config?: Record<string, unknown>;
    }
    export const Tailwind: React.FC<TailwindProps>;
}
