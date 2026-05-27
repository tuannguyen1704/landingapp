import Hero from "@/components/landing/hero";
import TrustSection from "@/components/landing/trust-section";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import Testimonials from "@/components/landing/testimonials";
import Integrations from "@/components/landing/integrations";
import Contact from "@/components/landing/contact";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Hero />
      <TrustSection />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Integrations />
      <Contact />
      <Footer />
    </div>
  );
}
