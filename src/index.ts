import ICAL from 'ical.js';

type NumberDictionary = { [index: string]: number };

export function cumulativeTimeSummary(
  filterStartDate: Date,
  filterEndDate: Date,
  iCalendarData: string
) {
  var jcalData = ICAL.parse(iCalendarData);
  var comp = new ICAL.Component(jcalData);
  var vevents = comp.getAllSubcomponents('vevent');

  if (
    typeof filterStartDate !== 'object' ||
    filterStartDate.toString() === 'Invalid Date'
  ) {
    throw 'filterStartDate is not of type "Date"';
  }
  if (
    typeof filterEndDate !== 'object' ||
    filterEndDate.toString() === 'Invalid Date'
  ) {
    throw 'filterEndDate is not of type "Date"';
  }
  if (filterStartDate > filterEndDate) {
    throw 'filterStartDate is after filterEndDate';
  }
  let cumulativeDurations: NumberDictionary = {};

  vevents.forEach((vevent) => {
    var event = new ICAL.Event(vevent);
    var summary = event.summary;
    var eventStartDate = event.startDate.toJSDate();
    let duration = event.duration.toSeconds() / 3600;

    if (event.sequence) {
      var expand = new ICAL.RecurExpansion({
        component: vevent,
        dtstart: vevent.getFirstPropertyValue('dtstart'),
      });

      let i = 0;
      let max = 500;
      let next;
      while ((next = expand.next())) {
        eventStartDate = next.toJSDate();

        if (i++ > max) {
          throw 'Too many dates';
        }
        if (eventStartDate < filterStartDate) {
          continue;
        }
        if (eventStartDate > filterEndDate) {
          break;
        }

        if (summary in cumulativeDurations) {
          cumulativeDurations[summary] += duration;
        } else {
          cumulativeDurations[summary] = duration;
        }
      }
    } else {
      if (eventStartDate < filterStartDate) {
        return;
      }
      if (eventStartDate > filterEndDate) {
        return;
      }

      if (cumulativeDurations.hasOwnProperty(summary)) {
        cumulativeDurations[summary] += duration;
      } else {
        cumulativeDurations[summary] = duration;
      }
    }
  });

  return cumulativeDurations;
}

export function CSVFromObject(object: NumberDictionary) {
  let csv = 'Activity, Hours\n';
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      csv += `"${key}", ${object[key].toFixed(2)}\n`;
    }
  }

  return csv;
}
