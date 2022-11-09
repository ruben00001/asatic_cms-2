import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "^redux/store";
import { selectSubjectsByIds } from "^redux/state/subjects";
import {
  selectLanguagesByIds,
  selectLanguagesIds,
} from "^redux/state/languages";
import { selectTagsByIds } from "^redux/state/tags";
import { selectAuthorsByIds } from "^redux/state/authors";
import { selectCollectionsByIds } from "^redux/state/collections";

import {
  checkObjectWithArrayFieldsHasValue,
  mapIds,
  mapLanguageIds,
} from "^helpers/general";
import {
  handleOwnTranslationWarnings,
  handleRelatedEntityWarnings,
} from "./helpers";
import { checkRelatedSubjectIsValid } from "^helpers/subject";
import { checkRelatedTagIsValid } from "^helpers/tag";
import { checkRelatedCollectionIsValid } from "^helpers/collection";
import { checkRelatedAuthorIsValid } from "^helpers/author";
import {
  checkIsValidTranslation,
  checkTranslationMeetsRequirements,
} from "^helpers/recorded-event";

import { EntityWarning } from "^types/entity-status";
import {
  RecordedEvent,
  RecordedEventRelatedEntity,
  RecordedEventStatus,
} from "^types/recordedEvent";

// todo: recordedeventtype
export const selectRecordedEventStatus = createSelector(
  [(state: RootState) => state, (_state, entity: RecordedEvent) => entity],
  (state, recordedEvent): RecordedEventStatus => {
    if (!recordedEvent.lastSave) {
      return "new";
    }

    if (recordedEvent.publishStatus === "draft") {
      return "draft";
    }

    if (!recordedEvent.youtubeId) {
      return "invalid";
    }

    const relatedLanguages = selectLanguagesByIds(
      state,
      mapLanguageIds(recordedEvent.translations)
    );
    const validRelatedLanguageIds = mapIds(
      relatedLanguages.flatMap((e) => (e ? [e] : []))
    );

    const validTranslation = recordedEvent.translations.find((translation) =>
      checkTranslationMeetsRequirements(
        translation,
        ["valid language", "title"],
        validRelatedLanguageIds
      )
    );
    /*     const hasValidTranslation = checkRecordedEventHasValidTranslation(
      recordedEvent.translations,
      validRelatedLanguageIds
    ); */

    if (!validTranslation) {
      return "invalid";
    }

    const warnings: EntityWarning<RecordedEventRelatedEntity> = {
      ownTranslationsWithoutRequiredField: [],
      relatedEntitiesMissing: [],
      relatedEntitiesInvalid: [],
    };

    handleOwnTranslationWarnings({
      translations: recordedEvent.translations,
      checkValidity: (translation) =>
        checkIsValidTranslation(translation, validRelatedLanguageIds),
      onInvalid: (translation) =>
        warnings.ownTranslationsWithoutRequiredField.push({
          languageId: translation.languageId,
        }),
    });

    if (relatedLanguages.includes(undefined)) {
      warnings.relatedEntitiesMissing.push("language");
    }

    const relatedSubjects = selectSubjectsByIds(
      state,
      recordedEvent.subjectsIds
    );

    handleRelatedEntityWarnings({
      entityWarnings: warnings,
      relatedEntity: {
        type: "subject",
        entities: relatedSubjects,
        checkValidity: checkRelatedSubjectIsValid,
      },
    });

    const relatedTags = selectTagsByIds(state, recordedEvent.tagsIds);

    handleRelatedEntityWarnings({
      entityWarnings: warnings,
      relatedEntity: {
        type: "tag",
        entities: relatedTags,
        checkValidity: checkRelatedTagIsValid,
      },
    });

    const relatedCollections = selectCollectionsByIds(
      state,
      recordedEvent.collectionsIds
    );

    const allLanguageIds = selectLanguagesIds(state) as string[];

    handleRelatedEntityWarnings({
      entityWarnings: warnings,
      relatedEntity: {
        type: "collection",
        entities: relatedCollections,
        checkValidity: (collection) =>
          checkRelatedCollectionIsValid(collection, allLanguageIds),
      },
    });

    const relatedAuthors = selectAuthorsByIds(state, recordedEvent.authorsIds);

    handleRelatedEntityWarnings({
      entityWarnings: warnings,
      relatedEntity: {
        type: "author",
        entities: relatedAuthors,
        checkValidity: (author) =>
          checkRelatedAuthorIsValid(author, validRelatedLanguageIds),
      },
    });

    const isError = checkObjectWithArrayFieldsHasValue(warnings);

    if (isError) {
      return { status: "warning", warnings };
    }

    return "good";
  }
);
