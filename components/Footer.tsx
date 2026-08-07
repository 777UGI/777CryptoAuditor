export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-background py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-foreground/60 text-sm">
          &copy; {new Date().getFullYear()} 777 ChainScan. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
