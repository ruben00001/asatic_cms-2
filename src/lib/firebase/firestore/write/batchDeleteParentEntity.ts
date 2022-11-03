import { arrayRemove, writeBatch, WriteBatch } from "@firebase/firestore/lite";

import { firestore } from "^lib/firebase/init";
import { Collection as CollectionKey } from "../collectionKeys";
import { getDocRef } from "../getRefs";

type ParentEntityType =
  | "article"
  | "blog"
  | "collection"
  | "recorded-event"
  | "subject";

type ParentEntity = {
  type: ParentEntityType;
  collectionKey: Extract<
    CollectionKey,
    | CollectionKey.ARTICLES
    | CollectionKey.BLOGS
    | CollectionKey.COLLECTIONS
    | CollectionKey.RECORDEDEVENTS
    | CollectionKey.SUBJECTS
  >;
  id: string;
};

type SubEntityCollectionKey = Extract<
  CollectionKey,
  | CollectionKey.AUTHORS
  | CollectionKey.COLLECTIONS
  | CollectionKey.SUBJECTS
  | CollectionKey.TAGS
  | CollectionKey.ARTICLES
  | CollectionKey.BLOGS
  | CollectionKey.RECORDEDEVENTS
>;

// todo: what to do for subject-collection relationship
const batchUpdateSubEntities = (
  batch: WriteBatch,
  subEntityCollectionKey: SubEntityCollectionKey,
  subEntityIds: string[],
  parentEntity: { type: ParentEntityType; entityId: string }
) => {
  for (let i = 0; i < subEntityIds.length; i++) {
    const subEntityId = subEntityIds[i];
    const subEntityDocRef = getDocRef(subEntityCollectionKey, subEntityId);
    const subEntityIsPrimaryEntity =
      subEntityCollectionKey === CollectionKey.ARTICLES ||
      subEntityCollectionKey === CollectionKey.BLOGS ||
      subEntityCollectionKey === CollectionKey.RECORDEDEVENTS;
    const updateData = subEntityIsPrimaryEntity
      ? {
          [parentEntity.type === "collection"
            ? "collectionsIds"
            : "subjectsIds"]: arrayRemove(parentEntity.entityId),
        }
      : {
          relatedEntities: arrayRemove(parentEntity),
        };
    batch.update(subEntityDocRef, updateData);
  }
};

export const deleteParentEntity = async ({
  parentEntity,
  subEntities,
}: {
  parentEntity: ParentEntity;
  subEntities: { collectionKey: SubEntityCollectionKey; ids: string[] }[];
}) => {
  const batch = writeBatch(firestore);

  const parentDocRef = getDocRef(parentEntity.collectionKey, parentEntity.id);
  batch.delete(parentDocRef);

  for (let i = 0; i < subEntities.length; i++) {
    batchUpdateSubEntities(
      batch,
      subEntities[i].collectionKey,
      subEntities[i].ids,
      {
        type: parentEntity.type,
        entityId: parentEntity.id,
      }
    );
  }

  await batch.commit();
};

export type DeletePrimaryEntityProps = {
  entityId: string;
  authorsIds: string[];
  collectionsIds: string[];
  subjectsIds: string[];
  tagsIds: string[];
};

export const deleteArticle = async ({
  entityId,
  authorsIds,
  collectionsIds,
  subjectsIds,
  tagsIds,
}: DeletePrimaryEntityProps) =>
  await deleteParentEntity({
    parentEntity: {
      id: entityId,
      collectionKey: CollectionKey.ARTICLES,
      type: "article",
    },
    subEntities: [
      { collectionKey: CollectionKey.AUTHORS, ids: authorsIds },
      { collectionKey: CollectionKey.COLLECTIONS, ids: collectionsIds },
      { collectionKey: CollectionKey.SUBJECTS, ids: subjectsIds },
      { collectionKey: CollectionKey.TAGS, ids: tagsIds },
    ],
  });

export const deleteBlog = async ({
  entityId,
  authorsIds,
  collectionsIds,
  subjectsIds,
  tagsIds,
}: DeletePrimaryEntityProps) =>
  await deleteParentEntity({
    parentEntity: {
      id: entityId,
      collectionKey: CollectionKey.BLOGS,
      type: "blog",
    },
    subEntities: [
      { collectionKey: CollectionKey.AUTHORS, ids: authorsIds },
      { collectionKey: CollectionKey.COLLECTIONS, ids: collectionsIds },
      { collectionKey: CollectionKey.SUBJECTS, ids: subjectsIds },
      { collectionKey: CollectionKey.TAGS, ids: tagsIds },
    ],
  });

export const deleteRecordedEvent = async ({
  entityId,
  authorsIds,
  collectionsIds,
  subjectsIds,
  tagsIds,
}: DeletePrimaryEntityProps) =>
  await deleteParentEntity({
    parentEntity: {
      id: entityId,
      collectionKey: CollectionKey.RECORDEDEVENTS,
      type: "recorded-event",
    },
    subEntities: [
      { collectionKey: CollectionKey.AUTHORS, ids: authorsIds },
      { collectionKey: CollectionKey.COLLECTIONS, ids: collectionsIds },
      { collectionKey: CollectionKey.SUBJECTS, ids: subjectsIds },
      { collectionKey: CollectionKey.TAGS, ids: tagsIds },
    ],
  });

export type DeleteCollectionProps = {
  entityId: string;
  subjectsIds: string[];
  tagsIds: string[];
  articlesIds: string[];
  blogsIds: string[];
  recordedEventsIds: string[];
};

export const deleteCollection = async ({
  entityId,
  subjectsIds,
  tagsIds,
  articlesIds,
  blogsIds,
  recordedEventsIds,
}: DeleteCollectionProps) =>
  await deleteParentEntity({
    parentEntity: {
      id: entityId,
      collectionKey: CollectionKey.COLLECTIONS,
      type: "collection",
    },
    subEntities: [
      { collectionKey: CollectionKey.SUBJECTS, ids: subjectsIds },
      { collectionKey: CollectionKey.TAGS, ids: tagsIds },
      { collectionKey: CollectionKey.ARTICLES, ids: articlesIds },
      { collectionKey: CollectionKey.BLOGS, ids: blogsIds },
      { collectionKey: CollectionKey.RECORDEDEVENTS, ids: recordedEventsIds },
    ],
  });

export type DeleteSubjectProps = {
  entityId: string;
  articlesIds: string[];
  blogsIds: string[];
  collectionIds: string[];
  recordedEventsIds: string[];
  tagsIds: string[];
};

export const deleteSubject = async ({
  entityId,
  articlesIds,
  blogsIds,
  collectionIds,
  recordedEventsIds,
  tagsIds,
}: DeleteSubjectProps) =>
  await deleteParentEntity({
    parentEntity: {
      id: entityId,
      collectionKey: CollectionKey.SUBJECTS,
      type: "subject",
    },
    subEntities: [
      { collectionKey: CollectionKey.ARTICLES, ids: articlesIds },
      { collectionKey: CollectionKey.BLOGS, ids: blogsIds },
      { collectionKey: CollectionKey.COLLECTIONS, ids: collectionIds },
      { collectionKey: CollectionKey.RECORDEDEVENTS, ids: recordedEventsIds },
      { collectionKey: CollectionKey.TAGS, ids: tagsIds },
    ],
  });
