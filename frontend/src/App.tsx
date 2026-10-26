import { Routes, Route } from "react-router-dom";
import ArticleListPage from "./pages/ArticleListPage";
import ArticleNewPage from "./pages/ArticleNewPage";
import ArticleEditPage from "./pages/ArticleEditPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ArticleListPage />} />
      <Route path="/articles" element={<ArticleListPage />} />
      <Route path="/articles/new" element={<ArticleNewPage />} />
      <Route path="/articles/:id/edit" element={<ArticleEditPage />} />
      <Route path="/categories" element={<CategoryPage />} />
      <Route path="/tags" element={<TagPage />} />
    </Routes>
  );
}