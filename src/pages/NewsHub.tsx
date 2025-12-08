import { NewsList } from "../components/NewsList";

export default function NewsHub() {
  return (
    <section className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Markedsnyheder</h1>
      <NewsList />
      <h2 className="text-lg font-semibold mt-6">Apple (eksempel)</h2>
      <NewsList symbol="Apple" />
    </section>
  );
}
