import CasesList from "./CasesList";

export default function WritingIndex({ category }: { category: string | null }) {
  return (
    <main className="writing-page">
      <CasesList category={category} />
    </main>
  );
}
