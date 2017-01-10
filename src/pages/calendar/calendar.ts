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
  differenceInCalendarDays
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
  //originalBooking: Booking;
  originalBookingStartDate: Date;
  originalBookingEndDate: Date;
  _events = [];
  refresh: Subject<any> = new Subject();
  bookingsSubscription: Subscription;

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
      console.log('booking to modify', this.session.booking);
      this.viewDate = this.session.booking.event.start;
    }
    let loading = this.loadingCtrl.create({
      content: 'Please wait while we load the calendar'
    });
    loading.present();
    this.bookingsSubscription = this.bookingService.findBookingsByMonth(this.viewDate)
      .subscribe(
          (bookings) => {
                          loading.dismiss();
                          this._events = bookings.map(booking => booking.event);
                          if (!this.session.booking.isNew()) {
                            const bookingSelected = bookings
                                                    .filter(booking => booking.$key == this.session.booking.$key);
                            this.session.booking = bookingSelected[0];
                            this.originalBookingStartDate = this.session.booking.event.start;
                            this.originalBookingEndDate = this.session.booking.event.end;
                          }
                          console.log('booking selected', this.session.booking);
                          this.refresh.next();
                        }
      );
  }

  dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {
    if (isPast(date) || (events.length > 0)) {
      // return;
    }
    if (this.session.booking.event.start && this.session.booking.event.end) {
      this.cancelEvent();
    } 
    if (!this.session.booking.event.start || this.session.booking.event.start > date) {
      this.session.booking.event.start = date;
    } else {
      this.session.booking.event.end = date;
      this.confirmBooking();
    }
    this.refresh.next();
  }

  cancelEvent() {
    //this.events = this.events.filter(iEvent => iEvent !== this.session.booking.event);
    this.session.booking.event.start = null;
    this.session.booking.event.end = null;
  }
  resetEvent() {
    //this.events = this.events.filter(iEvent => iEvent !== this.session.booking.event);
    this.session.booking.event.start = this.originalBookingStartDate;
    this.session.booking.event.end = this.originalBookingEndDate;
  }

  dayModifier = (dayCell) => {
    if (!this.session.booking) {
      return 
    }
    const eventToBeBooked = this.session.booking.event;
    let isDayWithinEvent = false;
    if (eventToBeBooked.start) {
      const cellDate = dayCell.date;
      isDayWithinEvent = isSameDay(cellDate, eventToBeBooked.start) || 
                              isSameDay(cellDate, eventToBeBooked.end) ||
                              (isAfter(cellDate, eventToBeBooked.start) && isBefore(cellDate, eventToBeBooked.end));
      if (isDayWithinEvent) {
        if (this.session.booking.isNew()) {
          dayCell.cssClass = 'cal-day-to-be-booked-cell';
        } else {
          dayCell.cssClass = 'cal-day-to-be-modified-cell';
        }
      }
    }
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
            if (this.session.booking.isNew()) {
              this.cancelEvent();
            } else {
              this.resetEvent();
            }
            this.refresh.next();
          }
        },
        {
          text: 'Yeap',
          handler: () => {
            if (this.session.booking.isNew()) {
              // insert a new booking
              this._events.push(this.session.booking.event);
              let bookingSubscription = this.bookingService.createNewBooking(this.session.user, this.session.booking)
                                              .subscribe(
                                                () => {
                                                        console.log('booking created');
                                                        this.bookingsSubscription.unsubscribe();
                                                        this.bookingsSubscription = null;
                                                        this.navCtrl.setRoot(MyBookingsPage);
                                                      },
                                                (err) => console.log(ErrorEvent)
                                              );
            } else {
              // update a booking
              let bookingSubscription = this.bookingService.updateBooking(this.session.booking)
                                              .subscribe(
                                                () => {
                                                        console.log('booking updated');
                                                        this.bookingsSubscription.unsubscribe();
                                                        this.bookingsSubscription = null;
                                                        this.navCtrl.setRoot(MyBookingsPage);
                                                      },
                                                (err) => console.log(ErrorEvent)
                                              );
            }
            this.refresh.next();
            this.bookingRegistered();
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

  ngOnDestroy(){
    if (this.bookingsSubscription) {
      this.bookingsSubscription.unsubscribe();
    }
  }

}
