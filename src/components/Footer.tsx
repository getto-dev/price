export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 text-center">
      <p className="text-xs text-muted-foreground font-medium">
        <a
          href="https://t.me/gettocode"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Getto-Dev
        </a>
        {" • "}
        {currentYear}
      </p>
    </footer>
  );
}
