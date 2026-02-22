import ExploreHero from "@/components/explore/ExploreHero";
import ExploreFilters from "@/components/explore/ExploreFilters";
import ExploreGrid from "@/components/explore/ExploreGrid";
import SeasonalHighlights from "@/components/explore/SeasonalHighlights";
import LocalExperiences from "@/components/explore/LocalExperiences";
import ExploreTestimonials from "@/components/explore/ExploreTestimonials";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-white font-sans scroll-smooth">
      <ExploreHero />
      <ExploreFilters />
      <ExploreGrid />
      <SeasonalHighlights />
      <LocalExperiences />
      <ExploreTestimonials />
    </main>
  );
}
