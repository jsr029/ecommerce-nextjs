import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-stage-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="font-display text-2xl tracking-[0.2em] text-gold-gradient mb-3">LUNA</p>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              Univers musical — singles, albums, lives et concerts.
              Écoutez, téléchargez, vivez la scène.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li><Link href="/products" className="hover:text-gold-400 transition">Musique</Link></li>
              <li><Link href="/live" className="hover:text-gold-400 transition">Live</Link></li>
              <li><Link href="/events" className="hover:text-gold-400 transition">Concerts</Link></li>
              <li><Link href="/subscription" className="hover:text-gold-400 transition">Fan Club</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-4">Légal & contact</h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <Link href="/cgv" className="hover:text-gold-400 transition">
                  CGV
                </Link>
              </li>
              <li className="text-stone-400">support@luna-music.com</li>
              <li className="text-stone-500">Press & management</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-8 text-center text-xs text-stone-500 tracking-wider">
          © {new Date().getFullYear()} LUNA — Tous droits réservés ·{" "}
          <Link href="/cgv" className="text-stone-400 hover:text-gold-400">
            Conditions Générales de Vente
          </Link>
        </div>
      </div>
    </footer>
  );
}
