import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-slate-100 p-6">
          {children}
        </main>
        <footer className="border-t bg-white px-6 py-3">
          <a
            href="https://www.alio.ao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>Desenvolvido por</span>
            <img
              src="https://image2url.com/images/1760650488458-254fd984-d4dd-4ef1-8b68-902a557db6c9.png"
              alt="Alio Analytics"
              className="h-6"
            />
          </a>
        </footer>
      </div>
    </div>
  );
}
