import { Categories } from "./categories";
import { MostRead } from "./most-read";
import { AdPlaceholder } from "./ad-placeholder";

export function Sidebar() {
  return (
    <aside className="space-y-6">
      <Categories />
      <MostRead />
      <AdPlaceholder />
    </aside>
  );
}
