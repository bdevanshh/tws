import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl tracking-tight">About The Wish Society</h1>
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6 text-[15px] leading-relaxed sm:p-8">
            <p>
              We are not selling a book. We are selling{" "}
              <strong>uncertainty, done respectfully</strong> — Mystery + Stories +
              Characters + Culture + Collectibles + Surprise.
            </p>
            <p className="text-muted-foreground">
              Every box funds accurate, reverent storytelling: scholars review sacred
              figures, artists are credited, and rarity always describes the{" "}
              <em>object</em> — the foil, the numbering, the edition — never the holiness
              of a deity.
            </p>
            <p className="font-serif text-xl text-primary">
              “You choose the box. We create the mystery. You discover the story.”
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Brand promise
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Never selectable: character, story, card, product, collectible.</li>
              <li>Always mysterious until the physical seal breaks.</li>
              <li>Wishes live on paper first — then, if good, in our Hall of Wishes.</li>
              <li>Cultures are hosts, not costumes.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
