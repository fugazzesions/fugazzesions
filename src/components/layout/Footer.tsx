export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper py-5 px-5 sm:px-8 flex justify-between items-center flex-wrap gap-2">
      <span className="font-display text-xl">Fugazzesions</span>
      <span className="text-[11px] tracking-[0.2em] uppercase text-red">
        Pizza · Patín · Punto
      </span>
      <span className="text-[10px] tracking-wide text-paper/50">
        © {year}
      </span>
    </footer>
  );
}