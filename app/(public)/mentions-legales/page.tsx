import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

// Adresse de l'hébergeur : à vérifier sur la politique de confidentialité de vercel.com si elle change.
const HEBERGEUR = { nom: "Vercel Inc.", adresse: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis", site: "https://vercel.com" };

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="border-b border-rule pb-1.5 font-semibold">{titre}</h2>
      <div className="max-w-[68ch] space-y-2 leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <article className="space-y-8">
      <h1 className="text-[2.25rem] font-bold leading-tight tracking-[-0.025em]">Mentions légales</h1>
      <Bloc titre="Éditeur">
        <p>
          Radar Data Assurance est un blog personnel, édité à titre non professionnel et sans but commercial. Comme le permet la loi
          pour la confiance dans l&apos;économie numérique (LCEN) aux personnes éditant à titre non professionnel, son auteur ne rend
          pas public son nom ; ses éléments d&apos;identification ont été communiqués à l&apos;hébergeur.
        </p>
      </Bloc>
      <Bloc titre="Hébergeur">
        <p>
          {HEBERGEUR.nom}, {HEBERGEUR.adresse}.{" "}
          <a href={HEBERGEUR.site} className="font-medium text-prusse underline dark:text-ink">vercel.com</a>
        </p>
      </Bloc>
      <Bloc titre="Contenus">
        <p>
          Les articles expriment une opinion personnelle. Ils n&apos;engagent aucun employeur ni aucune autre organisation et ne
          constituent pas un conseil juridique. Ils ne contiennent aucune information relative à des clients ou à des missions.
        </p>
        <p>Les textes sont ceux de l&apos;auteur, sauf citations, toujours accompagnées de leur source. Leur reprise est libre avec un lien vers l&apos;article.</p>
      </Bloc>
      <Bloc titre="Données personnelles">
        <p>
          Les pages publiques ne collectent aucune donnée personnelle et ne déposent ni cookie ni traceur de mesure d&apos;audience.
          Comme tout hébergeur, Vercel peut conserver des journaux techniques de connexion pour la sécurité et le fonctionnement du service.
        </p>
      </Bloc>
    </article>
  );
}
