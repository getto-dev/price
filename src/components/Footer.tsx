export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 text-center">
      <p className="text-xs text-muted-foreground font-medium">
        Getto-Dev • {currentYear}
      </p>
    </footer>
  );
}
