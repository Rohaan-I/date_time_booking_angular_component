import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';

interface TimeSlot {
  startHour: number,
  endHour: number,
  startPhase: string,
  endPhase: string,
  isHighLighted: boolean
  isEnabled: boolean,
  isVisible: boolean;
};

interface DateTimeRange {
  date: string,
  startingHourLimit?: number,
  endingHourLimit?: number,
  startingPhase?: string,
  endingPhase?: string,
  selectedTimeRanges?: [
    {
      hour: number,
      phase: string,
    }
  ],
  hourlyRate: number,
  currency: string
};

interface ReturnedObject {
  date: string,
  timeSlots: TimeSlot[],
  totalCharges: number,
  currency: string
};

/**
 *  Object structure that needs to be passed as input to this component.
 * 
 * {
 *    "date": "",
 *    "startingHourLimit": "",
 *    "endingHourLimit": "",
 *    "startingPhase": "",
 *    "endingPhase": "",
 *    "selectedTimeRanges" = [
 *      {
 *        "hour": "",
 *        "phase": "",
 *      }
 *    ],
      hourlyCharge: "",
      currency: ""
 * }
 */


@Component({
  selector: 'date-time-booking',
  templateUrl: 'date-time-booking.html',
  styleUrls: ['date-time-booking.css'],
})
export class DateTimeBookingComponent {

  //@Input() dateTimeRange: DateTimeRange;
  @Output() triggerBookNow: EventEmitter<any> = new EventEmitter<any>();
  dateTimeRange: DateTimeRange = {
    date: "07/17/2018",
    startingHourLimit: 9,
    endingHourLimit: 5,
    startingPhase: "am",
    endingPhase: "pm",
    selectedTimeRanges: [
      {
        hour: 9,
        phase: "am"
      },
      {
        hour: 10,
        phase: "am"
      }
    ],
    hourlyRate: 100,
    currency: 'AED'
  };

  timeSlots: TimeSlot[] = [];
  date = new FormControl(new Date(this.dateTimeRange.date));
  currency: string = this.dateTimeRange.currency;
  totalCharges: number = 0;

  returnedObject: ReturnedObject = {
    date: this.dateTimeRange.date,
    timeSlots: [],
    currency: this.currency,
    totalCharges: 0
  };


  constructor() {

    this.initializeTimeSlots();
    this.setStartingAndEndingRange();
    this.disableSelectedSlots();
  }

  initializeTimeSlots () {
    let attempts = 2;
    let totalHours = 12;
    let startPhase = 'pm';
    let endPhase = 'am';

    let isEnabled = true;

    for(let attempt = 1; attempt <= attempts; attempt++) {
      for(let hour = 0; hour < totalHours; hour++) {
        let startHour = (hour + totalHours) % totalHours;
        let endHour = startHour + 1; 
        
        // switching am to pm or pm to am
        if(startHour == 0) {
          if(startPhase == 'am') startPhase = 'pm';
          else startPhase = 'am';
        }
        if(endHour == 12) {
          if(endPhase == 'am') endPhase = 'pm';
          else endPhase = 'am';
        }

        if(startHour == 0) {
          this.timeSlots.push({
            startHour: totalHours,
            endHour: endHour,
            startPhase: startPhase,
            endPhase: endPhase,
            isHighLighted: false,
            isEnabled: true,
            isVisible: true
          });
        }
        else {
          this.timeSlots.push({
            startHour: startHour,
            endHour: endHour,
            startPhase: startPhase,
            endPhase: endPhase,
            isHighLighted: false,
            isEnabled: true,
            isVisible: true
          });
        }
      }
    }
  }

  setStartingAndEndingRange() {

    if(!this.dateTimeRange.startingHourLimit ||         
       !this.dateTimeRange.endingHourLimit) {

      for(let i = 0; i < this.timeSlots.length; i++) {
        this.timeSlots[i].isVisible = true;
      }
    }
    else {
      let isVisible = false;
      for(let i = 0; i < this.timeSlots.length; i++) {
        if(this.timeSlots[i].startHour == this.dateTimeRange.startingHourLimit && 
            this.timeSlots[i].startPhase == this.dateTimeRange.startingPhase) {
              isVisible = true;
        }

        if(this.timeSlots[i].startHour == (this.dateTimeRange.endingHourLimit) && 
            this.timeSlots[i].startPhase == this.dateTimeRange.endingPhase) {
              isVisible = false;
        }

        this.timeSlots[i].isVisible = isVisible;
      }
    }
  }

  disableSelectedSlots() {

    if(!this.dateTimeRange.selectedTimeRanges || this.dateTimeRange.selectedTimeRanges.length == 0) {
      return;
    }

    for(let i = 0; i < this.timeSlots.length; i++) {
      for(let j = 0; j < this.dateTimeRange.selectedTimeRanges.length; j++) {
        if(this.timeSlots[i].startHour == this.dateTimeRange.selectedTimeRanges[j].hour
          &&
          this.timeSlots[i].startPhase == this.dateTimeRange.selectedTimeRanges[j].phase
        ) {
          this.timeSlots[i].isEnabled = false;
        }
      }
    }
  }

  selectTimeSlot(time) {
    time.isHighLighted = !time.isHighLighted;

    if(time.isHighLighted == true) {
      this.returnedObject.totalCharges += this.dateTimeRange.hourlyRate;
    }
    else {
      this.returnedObject.totalCharges -= this.dateTimeRange.hourlyRate;
    }

    this.totalCharges = this.returnedObject.totalCharges;

    this.returnedObject.timeSlots.push(time);
    
  }

  dateChanged(event) {
    this.returnedObject.date = event.value;
  }

  bookNow() {
    this.triggerBookNow.emit(this.returnedObject);

    this.totalCharges = 0;

    for(let i = 0; i < this.timeSlots.length; i++) {
      if(this.timeSlots[i].isHighLighted) {
        this.timeSlots[i].isHighLighted = false;
        this.timeSlots[i].isEnabled = false;
      }
    }
  }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */