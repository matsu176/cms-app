import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div>
      {/* アプリタイトル（画面左上）。全画面で共通 */}
      <header className="px-4 py-3">
        <h1 className="text-xl font-bold">CMS App</h1>
      </header>

      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}