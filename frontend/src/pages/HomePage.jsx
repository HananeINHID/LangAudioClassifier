import HeroSection from '../components/home/HeroSection';
import WhyUsSection from '../components/home/WhyUsSection';
import SupportedLanguagesSection from '../components/home/SupportedLanguagesSection';
import FeaturesSection from '../components/home/FeaturesSection';
import PipelineSection from '../components/home/PipelineSection';
import CTASection from '../components/home/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <HeroSection />
      <WhyUsSection />
      <SupportedLanguagesSection />
      <FeaturesSection />
      <PipelineSection />
      <CTASection />
    </div>
  );
}