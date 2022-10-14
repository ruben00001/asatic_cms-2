import { useSelector } from "^redux/hooks";
import { selectRecordedEventTypeById } from "^redux/state/recordedEventsTypes";

import RecordedEventTypeSlice from "^context/recorded-event-types/RecordedEventTypeContext";
import RecordedEventSlice from "^context/recorded-events/RecordedEventContext";

import { $Container } from "^components/related-entity-popover/_styles/relatedEntities";
import Found from "./Found";
import Missing from "./Missing";

const Populated = () => {
  const [{ recordedEventTypeId }] = RecordedEventSlice.useContext();

  const recordedEventType = useSelector((state) =>
    selectRecordedEventTypeById(state, recordedEventTypeId!)
  );

  return (
    <$Container>
      {recordedEventType ? (
        <RecordedEventTypeSlice.Provider recordedEventType={recordedEventType}>
          <Found />
        </RecordedEventTypeSlice.Provider>
      ) : (
        <Missing />
      )}
    </$Container>
  );
};

export default Populated;
