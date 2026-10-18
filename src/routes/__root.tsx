import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DemoBanner } from "@/components/layout/demo-banner";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "METEFICHA.BET — Cassino e Sportsbook Demonstrativo" },
      { name: "description", content: "Plataforma demonstrativa de cassino e apostas esportivas. Saldo, odds e eventos ficticios para fins de teste e avaliacao tecnica." },
      { property: "og:title", content: "METEFICHA.BET — Entre no jogo. Explore outro nivel." },
      { property: "og:description", content: "Ambiente demonstrativo de cassino e sportsbook. Nenhuma operacao financeira real." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <DemoBanner />
            <Header />
            <div className="flex flex-1">
              <SidebarNav />
              <main className="flex-1 pb-20 lg:pb-0">
                <Outlet />
              </main>
            </div>
            <BottomNav />
          </div>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
