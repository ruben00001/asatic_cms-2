import { fuzzySearch } from "^helpers/general";
import { useSelector } from "^redux/hooks";
import { selectAll as selectAuthors } from "^redux/state/authors";
import { selectAll as selectLanguages } from "^redux/state/languages";
import { selectAll as selectSubjects } from "^redux/state/subjects";
import { selectAll as selectTags } from "^redux/state/tags";

function useFuzzySearchPrimaryContent<
  TDoc extends {
    id: string;
    authorIds: string[];
    subjectIds: string[];
    tagIds: string[];
    translations: { title?: string; languageId: string }[];
  }
>(docs: TDoc[], query: string) {
  const allAuthors = useSelector(selectAuthors);
  const allSubjects = useSelector(selectSubjects);
  const allTags = useSelector(selectTags);
  const allLanguages = useSelector(selectLanguages);

  if (query.length < 1) {
    return docs;
  }

  // create searchable articles
  const queryableDocs = docs.map(
    ({ id, authorIds, subjectIds, tagIds, translations }) => {
      const authors = authorIds
        .map((id) => allAuthors.find((a) => a.id === id))
        .flatMap((a) => (a ? [a] : []))
        .flatMap((a) => a.translations)
        .flatMap((t) => t.name);

      const subjects = subjectIds
        .map((id) => allSubjects.find((a) => a.id === id))
        .flatMap((a) => (a ? [a] : []))
        .flatMap((a) => a.translations)
        .flatMap((t) => t.text);

      const tags = tagIds
        .map((id) => allTags.find((t) => t.id === id))
        .flatMap((a) => (a ? [a] : []))
        .flatMap((t) => t.text);

      const languageIds = translations.map((t) => t.languageId);
      const languages = languageIds
        .map((id) => allLanguages.find((l) => l.id === id))
        .flatMap((a) => (a ? [a] : []))
        .flatMap((t) => t.name);

      const titles = translations.map((t) => t.title);

      return {
        id,
        authors,
        subjects,
        tags,
        titles,
        languages,
      };
    }
  );

  const docsMatchingQueryById = fuzzySearch(
    ["titles", "authors", "subjects", "tags", "languages"],
    queryableDocs,
    query
  ).map((r) => r.item.id);

  const docsMatchingQuery = docsMatchingQueryById.map(
    (id) => docs.find((doc) => doc.id === id)!
  );

  return docsMatchingQuery;
}

export default useFuzzySearchPrimaryContent;
