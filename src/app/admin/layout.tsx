import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight text-primary">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin/participants" className={buttonVariants({ variant: 'ghost', className: 'justify-start text-muted-foreground hover:text-foreground text-lg h-12' })}>
            Participants
          </Link>
          <Link href="/admin/prizes" className={buttonVariants({ variant: 'ghost', className: 'justify-start text-muted-foreground hover:text-foreground text-lg h-12' })}>
            Prizes
          </Link>
          <Link href="/admin/winners" className={buttonVariants({ variant: 'ghost', className: 'justify-start text-muted-foreground hover:text-foreground text-lg h-12' })}>
            Winners
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className={buttonVariants({ variant: 'outline', className: 'w-full justify-start text-primary text-lg h-12' })}>
            Drawing Page
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}
