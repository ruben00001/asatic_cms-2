import { createContext, ReactElement, useContext } from "react";
import { checkObjectHasField } from "^helpers/general";
import { useDispatch } from "^redux/hooks";

import {
  addAuthor,
  addTag,
  addTranslation,
  removeAuthor,
  removeTag,
  removeOne,
  togglePublishStatus,
  updatePublishDate,
  updateSaveDate,
  updateSummaryImageSrc,
} from "^redux/state/recordedEvents";
import { RecordedEvent } from "^types/recordedEvent";
import { OmitFromMethods } from "^types/utilities";

const actionsInitial = {
  addAuthor,
  addTag,
  addTranslation,
  removeAuthor,
  removeTag,
  removeOne,
  togglePublishStatus,
  updatePublishDate,
  updateSaveDate,
  updateSummaryImageSrc,
};
type ActionsInitial = typeof actionsInitial;

type Actions = OmitFromMethods<ActionsInitial, "id">;

type Value = [recordedEvent: RecordedEvent, actions: Actions];

const Context = createContext<Value>([{}, {}] as Value);

const RecordedEventProvider = ({
  children,
  recordedEvent,
}: {
  children: ReactElement;
  recordedEvent: RecordedEvent;
}) => {
  const { id } = recordedEvent;

  const dispatch = useDispatch();

  // todo: maybe remove translation actions as will have their own Context

  const actions: Actions = {
    addAuthor: ({ authorId }) => dispatch(addAuthor({ id, authorId })),
    addTag: ({ tagId }) => dispatch(addTag({ id, tagId })),
    addTranslation: ({ languageId }) =>
      dispatch(addTranslation({ id, languageId })),
    removeAuthor: ({ authorId }) => dispatch(removeAuthor({ authorId, id })),
    removeOne: () => dispatch(removeOne({ id })),
    removeTag: ({ tagId }) => dispatch(removeTag({ id, tagId })),
    togglePublishStatus: () => dispatch(togglePublishStatus({ id })),
    updatePublishDate: ({ date }) => dispatch(updatePublishDate({ date, id })),
    updateSaveDate: ({ date }) => dispatch(updateSaveDate({ date, id })),
    updateSummaryImageSrc: ({ imgId }) =>
      dispatch(updateSummaryImageSrc({ id, imgId })),
  };

  const value: Value = [recordedEvent, actions];

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const useRecordedEventContext = () => {
  const context = useContext(Context);
  const contextIsPopulated = checkObjectHasField(context[0]);
  if (!contextIsPopulated) {
    throw new Error(
      "useRecordedEventContext must be used within its provider!"
    );
  }
  return context;
};

export { RecordedEventProvider, useRecordedEventContext };