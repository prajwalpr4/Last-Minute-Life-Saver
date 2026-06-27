import HomeNavbar from "@/components/landing/HomeNavbar";
import HomeHero from "@/components/landing/HomeHero";
import HomeAgenticShowcase from "@/components/landing/HomeAgenticShowcase";
import HomeFeatures from "@/components/landing/HomeFeatures";
import HomeSocialProof from "@/components/landing/HomeSocialProof";
import HomeFinalCTA from "@/components/landing/HomeFinalCTA";
import HomeFooter from "@/components/landing/HomeFooter";

export default function Home() {
  return (
    <>
      <HomeNavbar />
      <main className="flex-1">
        <HomeHero />
        <div id="how-it-works">
          <HomeAgenticShowcase />
        </div>
        <div id="features">
          <HomeFeatures />
        </div>
        <HomeSocialProof />
        <HomeFinalCTA />
      </main>
      <HomeFooter />
    </>
  );
}
