import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ArticleForm from "../components/ArticleForm";
import { createArticle, getErrorMessage } from "../api/articles";

export default function ArticleNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      toast.success("保存しました");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <div>
      <h1>記事の新規作成</h1>
      <ArticleForm
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? getErrorMessage(mutation.error) : null}
        onSubmit={(values) => mutation.mutate(values)}
        onCancel={() => navigate("/")}
      />
    </div>
  );
}