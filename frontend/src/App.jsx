import { Assistant } from './components/Assistant';
import { useSiteConfig } from './lib/api';
import { Download } from './sections/Download';
import { Faq } from './sections/Faq';
import { Features } from './sections/Features';
import { Footer } from './sections/Footer';
import { Hardware } from './sections/Hardware';
import { Hero } from './sections/Hero';
import { Nav } from './sections/Nav';
import { Newsletter } from './sections/Newsletter';
import { Objects } from './sections/Objects';
import { Pricing } from './sections/Pricing';
import { Steps } from './sections/Steps';
import { Ticker } from './sections/Ticker';

export default function App() {
  const config = useSiteConfig();
  return (
    <>
      <Nav />
      <main>
        <Hero config={config} />
        <Ticker />
        <Objects />
        <Features />
        <Hardware />
        <Steps />
        <Pricing plans={config.plans} />
        <Download downloads={config.downloads} />
        <Faq contact={config.contact} />
        <Newsletter interests={config.interests} />
      </main>
      <Footer contact={config.contact} />
      <Assistant />
    </>
  );
}
