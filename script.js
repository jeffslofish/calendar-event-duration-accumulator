function diff_minutes(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000 / 60;
    return Math.abs(Math.round(diff));
  }

  document.getElementById('upload').addEventListener('change', readFileAsString)
  function readFileAsString() {
    var files = this.files;
    if (files.length === 0) {
      console.log('No file is selected');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (event) {
      var iCalendarData = event.target.result;
      var jcalData = ICAL.parse(iCalendarData);
      var comp = new ICAL.Component(jcalData);
      var vevents = comp.getAllSubcomponents("vevent");

      let cumulativeDuration = {};

      vevents.forEach(vevent => {
        var event = new ICAL.Event(vevent);
        var summary = event.summary;
        var startDate = event.startDate.toJSDate();
        var endDate = event.endDate.toJSDate();
        let duration = event.duration.toSeconds() / 60;

        console.log(event);
        console.log(summary);
        console.log("Duration: ", duration)

        if (event.sequence) {
          var expand = new ICAL.RecurExpansion({
            component: vevent,
            dtstart: vevent.getFirstPropertyValue('dtstart')
          });

          let i = 0;
          let max = 50065;
          let dates = [];
          let now = new Date();
          let next;
          while (next = expand.next()) {
            if (next.toJSDate() > now) {
              break;
            }
            if (i++ > max) {
              console.error("too many dates");
              break;
            }
            console.log(next.toJSDate());

            if (cumulativeDuration.hasOwnProperty(summary)) {
              cumulativeDuration[summary] += duration;
            } else {
              cumulativeDuration[summary] = duration;
            }

            //console.log(summary, 'duration', cumulativeDuration[summary]);
          }
        } else {

          console.log(startDate);

          if (cumulativeDuration.hasOwnProperty(summary)) {
            cumulativeDuration[summary] += duration;
          } else {
            cumulativeDuration[summary] = duration;
          }

          console.log('');
        }

        console.log('---------------------------');
        console.log('');

        
      });

      console.log(cumulativeDuration);

    };
    reader.readAsText(files[0]);
  }