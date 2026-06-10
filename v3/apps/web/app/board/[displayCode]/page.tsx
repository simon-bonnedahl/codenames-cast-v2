import { BoardDisplay } from "./BoardDisplay";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ displayCode: string }>;
}) {
  const { displayCode } = await params;

  return <BoardDisplay displayCode={displayCode} />;
}
