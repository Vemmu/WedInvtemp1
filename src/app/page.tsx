import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import ScrollReveal from "@/components/providers/ScrollReveal";
import Loader from "@/components/intro/Loader";
import LotusGate from "@/components/intro/LotusGate";
import Dock from "@/components/ui/Dock";
import Hero from "@/components/sections/Hero";
import Nimantran from "@/components/sections/Nimantran";
import Story from "@/components/sections/Story";
import Pheras from "@/components/sections/Pheras";
import Muhurat from "@/components/sections/Muhurat";
import Events from "@/components/sections/Events";
import Rituals from "@/components/sections/Rituals";
import Venue from "@/components/sections/Venue";
import Gallery from "@/components/sections/Gallery";
import Families from "@/components/sections/Families";
import RSVP from "@/components/sections/RSVP";
import Footer from "@/components/sections/Footer";

/**
 * Template 4, "Shubh Vivah" (Hindu wedding). Scroll order:
 *  Rangoli loader → 3D lotus blooming on water → 3D varmala hero → unrolling nimantran scroll →
 *  our story → 3D Saat Phere around the sacred fire → muhurat dial → event panels →
 *  ritual guide → venue & travel → parallax gallery → families & guest notes → RSVP → footer
 */
export default function Home() {
  return (
    <ExperienceProvider>
      <Loader />
      <LotusGate />
      <Dock />

      <main className="relative overflow-x-clip">
        <Hero />
        <Nimantran />
        <Story />
        <Pheras />
        <Muhurat />
        <Events />
        <Rituals />
        <Venue />
        <Gallery />
        <Families />
        <RSVP />
      </main>
      <Footer />

      {/* Last, so its triggers are created after the pinned Pheras section (correct positions). */}
      <ScrollReveal />
    </ExperienceProvider>
  );
}
