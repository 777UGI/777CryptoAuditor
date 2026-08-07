import LogoutButton from "./LogoutButton";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function Header() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("auth_token");

  return (
    <header className="border-b border-card-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center overflow-hidden rounded-xl bg-background border border-card-border shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Image 
              src="/logo.jpg" 
              alt="777 ChainScan Logo" 
              width={40} 
              height={40} 
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">777 Crypto Auditor</h1>
            <p className="text-xs text-foreground/60 hidden sm:block">Instant Blockchain Transaction Auditor</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {isAuthenticated && <LogoutButton />}
        </nav>
      </div>
    </header>
  );
}

