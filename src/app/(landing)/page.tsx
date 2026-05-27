import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import TrustSection from '@/components/landing/trust-section';
import Features from '@/components/landing/features';
import HowItWorks from '@/components/landing/how-it-works';
import Testimonials from '@/components/landing/testimonials';
import Contact from '@/components/landing/contact';
import Integrations from '@/components/landing/integrations';
import Footer from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Integrations />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
