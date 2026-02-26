import { EventLog, Log } from 'ethers';

export function isEventLogWithArgs(event: Log | EventLog): event is EventLog {
  return (
    event instanceof EventLog &&
    event.args &&
    typeof event.args.from === 'string' &&
    typeof event.args.to === 'string' &&
    typeof event.args.value === 'bigint'
  );
}
