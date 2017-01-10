import {Component, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { Subject, Subscription } from 'rxjs/Rx';
import {
  isSameDay,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  isPast,
  differenceInCalendarDays,
  isWithinRange
} from 'date-fns';

import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/it';

import {CalendarEvent} from 'angular-calendar';
import {Session} from '../../providers/session';
import {BookingsService} from '../../providers/bookings-service';
import {Booking} from '../../model/booking';
import {MyBookingsPage} from '../my-bookings/my-bookings';

/*
  Generated class for the Calendar page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'calendar.html'
})
export class CalendarPage implements OnDestroy {
  viewDate: Date = new Date();
  originalEventCopy: CalendarEvent; // contains a copy of the original data of the event which is under modification
  _events = new Array<CalendarEvent>();
  refresh: Subject<any> = new Subject();
  bookingsSubscriptions = new Array<Subscription>();

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private session: Session,
    public alerCtrl: AlertController,
    public bookingService: BookingsService,
    public loadingCtrl: LoadingController
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CalendarPage');
    if (!this.session.booking.isNew()) {
      this.viewDate = this.session.booking.event.start;
    }
    let loading = this.loadingCtrl.create({
      content: 'Please wait while we load the calendar'
    });
    loading.present();
    let bookingSubscription = this.bookingService.findBookingsByMonth(this.viewDate)
      .subscribe(
          (bookings) => {
                          loading.dismiss();
                          this._events = bookings.map(booking => booking.event);
                          if (!this.session.booking.isNew()) {
                            const bookingSelected = bookings
                                                    .filter(booking => booking.$key == this.session.booking.$key);
                            this.session.booking = bookingSelected[0];
                            this.originalEventCopy = {
                              start: this.session.booking.event.start,
                              end: this.session.booking.event.end,
                              title: this.session.booking.event.title,
                              color: this.session.booking.event.color
                            }
                            // remove the event of the booking in the session from the list of events to be displayed
                            const indexOfBookingOnEdit = this._events.indexOf(this.session.booking.event);
                            this._events.splice(indexOfBookingOnEdit, 1);
                            this.resetDatesForEventInSession();
                          }
                          console.log('booking selected', this.session.booking);
                          this.refresh.next();
                        }
      );
      this.bookingsSubscriptions.push(bookingSubscription);
  }

  dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {
    if (isPast(date)) {
      // ignore clicks on past days
      const title = 'Past';
      const message = 'U can not book in the past'
      this.selectionNotValid(title, message);
      return;  
    }
    if ((events.length > 0)) {
      // ignore clicks on days with already some bookings
      this.resetDatesForEventInSession();
      const title = 'Not Free';
      const message = 'U can not book if the day is already booked'
      this.selectionNotValid(title, message);
      return;  
    }
    if (this.session.booking.event.start && !this.session.booking.event.end && date > this.session.booking.event.start) {
      let newEventContainsEvents = false;
      for (let i = 0; i < this._events.length; i++) {
        let eventStart = this._events[i].start;
        newEventContainsEvents = isWithinRange(eventStart, this.session.booking.event.start, date);
        if (newEventContainsEvents) {break}
      }
      if (newEventContainsEvents) {
        // ignore tentative bookings which contain other bookings
        this.resetDatesForEventInSession();
        const title = 'Contain other bookings';
        const message = 'U can not book a period which contains days already booked'
        this.selectionNotValid(title, message);
        return;
      }
    }
    
    if (this.session.booking.event.start && this.session.booking.event.end) {
      this.resetDatesForEventInSession();  // reset the start and end dates since the user has clicked again
    } 
    if (!this.session.booking.event.start || this.session.booking.event.start > date) {
      this.session.booking.event.start = date;
    } else {
      this.session.booking.event.end = date;
      this.confirmBooking();
    }
    this.refresh.next();
  }
  selectionNotValid(title: string, message: string) {
    let confirm = this.alerCtrl.create({
      title: title,
      message: message,
      enableBackdropDismiss: false,            
      buttons: [
        {
          text: 'OK'
        }
      ]
    });
    confirm.present()
  }

  resetDatesForEventInSession() {
    this.session.booking.event.start = null;
    this.session.booking.event.end = null;
    this.refresh.next();
  }

  dayModifier = (dayCell) => {
    const eventToBeBooked = this.session.booking.event;
    const isDayWithinEventToBeBooked = this.isCellWithinEvent(dayCell, eventToBeBooked);;
    let isDayWithinOriginalEvent = false;
    if (this.originalEventCopy) {
      isDayWithinOriginalEvent = this.isCellWithinEvent(dayCell, this.originalEventCopy);
    }
    if (isDayWithinEventToBeBooked) {
      dayCell.cssClass = 'cal-day-to-be-booked-cell';
    } else
    if (isDayWithinOriginalEvent) {
      dayCell.cssClass = 'cal-day-to-be-modified-cell';
    }
  }
  isCellWithinEvent(dayCell, event: CalendarEvent) : boolean {
    let isDayWithinEvent = false;
    if (event.start) {
      const cellDate = dayCell.date;
      isDayWithinEvent = isSameDay(cellDate, event.start) || 
                              isSameDay(cellDate, event.end) ||
                              (isAfter(cellDate, event.start) && isBefore(cellDate, event.end));
    }
    return isDayWithinEvent
  }

  confirmBooking() {
    let confTitle;
    let confMessage;
    if (this.session.booking.isNew()) {
      confTitle = 'Confirm booking?';
      confMessage = 'Do you confirm this booking?';
    } else {
      confTitle = 'Confirm change of booking?';
      confMessage = 'Do you confirm the change of this booking?';
    }
    let confirm = this.alerCtrl.create({
      title: confTitle,
      message: confMessage,
      enableBackdropDismiss: false,            
      buttons: [
        {
          text: 'NO',
          handler: () => {
            this.resetDatesForEventInSession();
            this.refresh.next();
          }
        },
        {
          text: 'Yeap',
          handler: () => {
            this.unsubscribeFirebase();
            if (this.session.booking.isNew()) {
              // insert a new booking
              this._events.push(this.session.booking.event);
              let bookingSubscription = this.bookingService.createNewBooking(this.session.user, this.session.booking)
                                              .subscribe(
                                                () => {
                                                        console.log('booking created');
                                                        this.bookingRegistered();
                                                      },
                                                (err) => console.log(ErrorEvent)
                                              );
              this.bookingsSubscriptions.push(bookingSubscription);
            } else {
              // update a booking
              console.log('booking updated 0', this.session.booking);
              let bookingSubscription = this.bookingService.updateBooking(this.session.booking)
                                              .subscribe(
                                                () => {
                                                        console.log('booking updated 1', this.session.booking);
                                                        this.bookingRegistered();
                                                      },
                                                (err) => console.log(ErrorEvent)
                                              );
              this.bookingsSubscriptions.push(bookingSubscription);
            }
          }
        }
      ]
    });
    confirm.present()
  }
  bookingRegistered() {
    let confirm = this.alerCtrl.create({
      title: 'Booking registered',
      message: 
        'Your booking request has been registered as pending. It will be confirmed as soon as you pay the Piccis ' +
        this.session.booking.duration()*this.session.user.fee + ' EUROs',
      enableBackdropDismiss: false,            
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.setRoot(MyBookingsPage);
          }
        }
      ]
    });
    confirm.present()
  }

  changeMonth(event) {
    if (event.value == 'next') {
      this.incrementMonth();
    } else {
      this.decrementMonth();
    }
  }
  swipeEvent(e) {
    if (e.direction == 2) {
      //direction 2 = right to left swipe.
      this.incrementMonth();
    } else 
    if (e.direction == 4) {
      //direction 4 = left to right swipe.
      this.decrementMonth();
    }
  }
  incrementMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }
  decrementMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  unsubscribeFirebase() {
    for(let i = 0; i < this.bookingsSubscriptions.length; i++) {
      this.bookingsSubscriptions[i].unsubscribe();
    }
  }
  ngOnDestroy(){
    this.unsubscribeFirebase();
  }

}
