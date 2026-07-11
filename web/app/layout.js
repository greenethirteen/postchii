import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'PostChii™ 🍡',
  description:
    'Text your bot a vacancy or listing. Get back a designed, branded social post — image, caption, LinkedIn version and CTA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <footer className="site">
          made with 🍡 by PostChii
          <span className="credits">
            Photos: Norlando Pobre, Tuantranseo, Shixart1985, Gfilip, perzon seo — CC BY /
            CC BY-SA via Wikimedia Commons
          </span>
        </footer>
      </body>
    </html>
  );
}
