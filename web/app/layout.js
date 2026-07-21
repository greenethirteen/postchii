import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';

const GADS_ID = 'AW-18339496959';

export const metadata = {
  title: 'Mochii™ 🍡',
  description:
    'Text your bot a vacancy or listing. Get back a designed, branded social post — image, caption, LinkedIn version and CTA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GADS_ID}');`}
        </Script>
        <Header />
        <main>{children}</main>
        <footer className="site">
          made with 🍡 by Mochii
          <span className="credits">
            Photos: Norlando Pobre, Tuantranseo, Shixart1985, Gfilip, perzon seo — CC BY /
            CC BY-SA via Wikimedia Commons
          </span>
        </footer>
      </body>
    </html>
  );
}
