import { Categories } from "./sidebar/categories";
import { MostRead } from "./sidebar/most-read";
import { AdPlaceholder } from "./sidebar/ad-placeholder";

export function Sidebar() {
  return (
    <aside className="space-y-6">
      <Categories />
      <MostRead />
      <AdPlaceholder />
    </aside>
  );
}
