import Header from '@/components/Header';
import Nav from '@/components/Nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Nav />
      <div className="app-col">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
