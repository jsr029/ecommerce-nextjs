import Link from "next/link";

export const metadata = {
  title: "CGV — LUNA",
  description: "Conditions Générales de Vente",
};

export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500 mb-2">Légal</p>
      <h1 className="font-display text-4xl text-stone-100 mb-8">
        Conditions Générales de Vente
      </h1>

      <div className="prose-invert space-y-8 text-stone-300 text-sm leading-relaxed">
        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes de
            produits physiques, contenus numériques (musique, vidéo, photos) et
            abonnements proposés sur le site LUNA. Toute commande implique
            l&apos;acceptation sans réserve des présentes CGV.
          </p>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">2. Produits et services</h2>
          <ul className="list-disc list-inside space-y-2 text-stone-400">
            <li><strong className="text-stone-200">Produits physiques</strong> : merchandising, objets — stock limité.</li>
            <li><strong className="text-stone-200">Contenus numériques</strong> : fichiers audio, vidéo, packs photos — téléchargement après paiement validé.</li>
            <li><strong className="text-stone-200">Musique</strong> : préécoute gratuite limitée ; téléchargement complet via achat unitaire ou abonnement actif.</li>
            <li><strong className="text-stone-200">Abonnements</strong> : accès illimité au catalogue musical pendant la durée souscrite.</li>
            <li><strong className="text-stone-200">Événements / billets</strong> : informations indicatives ; conditions spécifiques du lieu peuvent s&apos;appliquer.</li>
          </ul>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">3. Prix et paiement</h2>
          <p>
            Les prix sont indiqués en euros TTC. Le paiement s&apos;effectue notamment via
            PayPal (sandbox en démonstration). La commande est considérée comme payée
            lorsque le statut passe à « payée » après confirmation du prestataire de paiement.
          </p>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">4. Commande et statut</h2>
          <p className="mb-3">Statuts possibles :</p>
          <ul className="list-disc list-inside space-y-1 text-stone-400">
            <li><strong className="text-stone-200">En attente</strong> — commande créée, paiement non confirmé</li>
            <li><strong className="text-stone-200">Payée</strong> — paiement validé</li>
            <li><strong className="text-stone-200">En cours</strong> — préparation</li>
            <li><strong className="text-stone-200">Expédiée</strong> — envoi physique</li>
            <li><strong className="text-stone-200">Livrée</strong> — terminée</li>
            <li><strong className="text-stone-200">Annulée</strong> — avec motif enregistré</li>
          </ul>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">5. Annulation</h2>
          <p className="mb-3">
            L&apos;annulation d&apos;une commande est soumise aux conditions suivantes :
          </p>
          <ul className="list-disc list-inside space-y-2 text-stone-400">
            <li>
              <strong className="text-stone-200">En attente / Payée / En cours</strong> :
              annulation possible par l&apos;administrateur avec motif obligatoire
              (minimum 5 caractères).
            </li>
            <li>
              <strong className="text-stone-200">Expédiée</strong> : annulation possible
              uniquement sur décision admin motivée ; le stock physique peut être réapprovisionné.
            </li>
            <li>
              <strong className="text-stone-200">Livrée</strong> : annulation refusée par défaut.
              Un cas exceptionnel peut être traité par l&apos;admin (force + motif).
            </li>
            <li>
              <strong className="text-stone-200">Contenus numériques déjà téléchargés</strong> :
              pas de remboursement systématique une fois le fichier livré, sauf non-conformité
              ou erreur technique imputable au vendeur.
            </li>
            <li>
              Les produits physiques annulés avant expédition font l&apos;objet d&apos;un
              <strong className="text-stone-200"> restock automatique</strong>.
            </li>
          </ul>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">6. Droit de rétractation</h2>
          <p>
            Conformément au droit de la consommation (UE), le droit de rétractation de 14 jours
            peut ne pas s&apos;appliquer aux contenus numériques fournis immédiatement après
            accord exprès du client et renonciation à ce droit. Pour les biens physiques,
            les modalités de retour seront précisées lors de l&apos;expédition.
          </p>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">7. Propriété intellectuelle</h2>
          <p>
            Les morceaux, clips et visuels restent protégés par le droit d&apos;auteur.
            L&apos;achat confère une licence d&apos;usage personnel non exclusive.
            Toute redistribution commerciale est interdite.
          </p>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">8. Données personnelles</h2>
          <p>
            Les données collectées (compte, commandes, adresse) servent uniquement à
            l&apos;exécution des ventes et au support. Contact : support@luna-music.com
          </p>
        </section>

        <section className="border border-white/10 bg-stage-900/60 rounded-2xl p-6">
          <h2 className="font-display text-xl text-gold-400 mb-3">9. Contact</h2>
          <p>
            Pour toute question relative aux commandes ou aux présentes CGV :
            <br />
            <span className="text-gold-400">support@luna-music.com</span>
          </p>
        </section>

        <p className="text-stone-500 text-xs">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")} — Document type pour démonstration.
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-gold-400 hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
