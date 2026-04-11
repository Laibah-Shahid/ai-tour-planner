import { notFound } from "next/navigation";
import { getDestinationById } from "@/data/destinationDetails";
import DestinationHero from "@/components/destination/DestinationHero";
import DestinationOverview from "@/components/destination/DestinationOverview";
import BestTimeSection from "@/components/destination/BestTimeSection";
import AttractionsSection from "@/components/destination/AttractionsSection";
import HotelsSection from "@/components/destination/HotelsSection";
import ExperiencesSection from "@/components/destination/ExperiencesSection";
import CostSection from "@/components/destination/CostSection";
import CTASection from "@/components/destination/CTASection";
import StickyPlanButton from "@/components/destination/StickyPlanButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const destination = getDestinationById(id);
  if (!destination) return { title: "Destination Not Found" };
  return {
    title: `${destination.name} — PakTour AI`,
    description: destination.description,
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { id } = await params;
  const destination = getDestinationById(id);

  if (!destination) notFound();

  return (
    <main className="min-h-screen bg-white">
      <DestinationHero destination={destination} />
      <DestinationOverview destination={destination} />
      <BestTimeSection destination={destination} />
      <AttractionsSection attractions={destination.attractions} />
      <HotelsSection hotels={destination.hotels} />
      <ExperiencesSection experiences={destination.experiences} />
      <CostSection destination={destination} />
      <CTASection
        destinationId={destination.id}
        destinationName={destination.name}
      />
      <StickyPlanButton destinationId={destination.id} />
    </main>
  );
}
