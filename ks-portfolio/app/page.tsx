import { getSiteData } from "@/lib/dataStore";
import SiteContent from "@/components/SiteContent";

// Always serve the latest saved content — this page reflects admin edits
// immediately on the next request, no rebuild required.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const data = getSiteData();
  return <SiteContent data={data} />;
}
