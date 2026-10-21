import { Link } from "react-router-dom";

type Props = {
  currentPage: number;
  totalPages: number;
};

const VISIBLE_PAGES = 5; // 表示するページ番号の数

const itemClass = "rounded border px-3 py-1 text-sm";

type NavItemProps = {
  to: string;
  disabled: boolean;
  children: string;
};

// 「先頭」「前へ」「次へ」「最後」のリンク。行けないときは、押せない表示にする
function NavItem({ to, disabled, children }: NavItemProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${itemClass} cursor-not-allowed border-gray-200 text-gray-400`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link to={to} className={`${itemClass} border-gray-300 hover:bg-gray-100`}>
      {children}
    </Link>
  );
}

export default function Pagination({ currentPage, totalPages }: Props) {
  // 1ページしかないときは、何も表示しない
  if (totalPages <= 1) return null;

  // 現在のページを中心に、5ページ分の範囲を決める
  let start = Math.max(1, currentPage - 2);
  let end = start + VISIBLE_PAGES - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - VISIBLE_PAGES + 1);
  }
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      aria-label="ページ送り"
      className="mt-6 flex items-center justify-center gap-2"
    >
      <NavItem to="?page=1" disabled={isFirst}>
        先頭
      </NavItem>
      <NavItem to={`?page=${currentPage - 1}`} disabled={isFirst}>
        前へ
      </NavItem>

      {pages.map((page) =>
        page === currentPage ? (
          // 現在のページは、色を付けて、押せない表示にする
          <span
            key={page}
            aria-current="page"
            className={`${itemClass} border-blue-600 bg-blue-600 text-white`}
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            to={`?page=${page}`}
            className={`${itemClass} border-gray-300 hover:bg-gray-100`}
          >
            {page}
          </Link>
        )
      )}

      <NavItem to={`?page=${currentPage + 1}`} disabled={isLast}>
        次へ
      </NavItem>
      <NavItem to={`?page=${totalPages}`} disabled={isLast}>
        最後
      </NavItem>
    </nav>
  );
}