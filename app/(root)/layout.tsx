import { Footer } from "@/components/footer";
import { NavbarClient } from "@/components/navbar-client";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="bg-background">
        <NavbarClient />
        <div>{children}</div>
        <Footer />
      </div>  
  );
}
