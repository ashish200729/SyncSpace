import { ReactNode } from "react";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { getServerSession } from "../../lib/server-session";

type SiteLayoutProps = {
  children: ReactNode;
};

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const session = await getServerSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Header initialSession={session} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
