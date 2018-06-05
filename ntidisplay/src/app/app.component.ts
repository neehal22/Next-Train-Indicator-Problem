import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = "NTI Display";

  // Maximum time of arrival prediction in minutes
  maxUpdateInterval = 15;

  // initial hour set by the test description.
  initialHour = 5;
  ntiClock;
  clockTimer;
  startDateObj;
  timeString = "";

  // Array that would contain train schedule info
  trainSchedule;

  /**
    * Set the train data
    */
  trains = [{
    name: 'Central Station',
    // interval in minutes to display arrival time.
    // We would show incoming trains in the next 15 minutes max.
    interval: 20,
    // logic to satisfy train schedule as per the test requirement.
    hasArrived: (time) => {
      // Every 20mins
      return time.getMinutes() % 20 == 0;
    }
  },
  {
    name: 'Circular',
    interval: 60,
    hasArrived: (time) => {
      // Every hour on the hour
      return time.getMinutes() == 0;
    }
  },
  {
    name: 'North Square',
    interval: 12,
    hasArrived: (time) => {
      // Every 12mins from 07:00 until 22:00
      return (time.getHours() >= 7 &&
        time.getHours() <= 22 &&
        time.getMinutes() % 12 == 0);
    }
  },
  {
    name: 'West Market',
    interval: 6,
    hasArrived: (time) => {
      // Every 6mins from 05:30 until 01:30
      return !((time.getHours() == 1 && time.getMinutes() > 30) ||
        (time.getHours() == 5 && time.getMinutes() < 30) ||
        (time.getHours() > 1 && time.getHours() < 5)) &&
        time.getMinutes() % 6 == 0;
    }
  }]

  ngOnInit() {
    /**
     * Set the clock up
     * -  Set the initial date object
     * -  Start the ticker updating a minute on the clock every 1 second. (VT)
     */
    let startDate = new Date().setHours(this.initialHour);
    startDate = new Date(startDate).setMinutes(0);
    startDate = new Date(startDate).setSeconds(0);
    this.startDateObj = new Date(startDate);
    this.setTimeString();

    this.clockTimer = setInterval(() => {
      this.ntiTick();
      this.updateTrainSchedule();
    }, 1000);
  }

  // Ticker updating the time every minute. (VT) 1min = 1sec
  ntiTick() {
    this.startDateObj = new Date(new Date(this.startDateObj).getTime() + (1000 * 60));
    this.setTimeString();
  }

  setTimeString() {
    this.timeString = this.startDateObj.toLocaleTimeString();
  }

  updateTrainSchedule() {
    // each schedule object in this array would contain the following:
    // name: name of the train
    // toa: time of arrival of the train
    this.trainSchedule = [];

    this.trains.forEach(element => {
      if (element.hasArrived(this.startDateObj)) {
        // Train has arrived.
        this.insertAndSort({
          name: element.name,
          toaMins: 0,
          toa: "Train has arrived"
        }, this.trainSchedule);
      }
      else {
        // Else check when in the next 15 minutes(max) would the train reach.
        let estimatedTimeInMins = element.interval > this.maxUpdateInterval ? this.maxUpdateInterval : element.interval;
        while (estimatedTimeInMins > 0) {
          if (element.hasArrived(this.addMinutes(this.startDateObj, estimatedTimeInMins))) {
            this.insertAndSort({
              name: element.name,
              toaMins: estimatedTimeInMins,
              toa: estimatedTimeInMins + (estimatedTimeInMins == 1 ? " minute" : " minutes")
            }, this.trainSchedule);
            break;
          }
          estimatedTimeInMins--;
        }
      }
    });
  }

  insertAndSort(element, array) {
    array.push(element);
    array.sort(function(a, b) {
      return a.toaMins - b.toaMins;
    });
  }
  
  addMinutes(date, minutes) {
    return new Date(date.getTime() + (minutes * (1000 * 60)))
  }

  ngOnDestroy() {
    clearInterval(this.clockTimer);
  }
}
