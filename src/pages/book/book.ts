import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import {CalendarPage} from '../calendar/calendar';
import {Session} from '../../providers/session';
import {BookingsService} from '../../providers/bookings-service';
import {User} from '../../model/user';
import {Booking} from '../../model/booking';
import {appConfig} from '../../app/app.config';

/*
  Generated class for the Book page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-book',
  templateUrl: 'book.html'
})
export class BookPage implements OnInit, OnDestroy {
  originalNumberOfGuests: number;
  bookingsSubscriptions = new Array<Subscription>();

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public session: Session,
    public bookingService: BookingsService,
    public alerCtrl: AlertController
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookPage');
  }
  ngOnInit() {
    console.log('BookPage init', this.session.booking);
    // if this is the first component on the view stack it means that we are
    // want to book a new booking, otherwise it means that BookPage
    // is used to manage an already existing booking (such as it happens When
    // BookPage is entered from MyBookingsPage to change an existing booking).
    if (this.navCtrl.first().name == 'BookPage' || !this.session.booking) {
      this.session.booking = new Booking();
      this.session.booking.guests = appConfig.defaultNumberOfGuests;
    }
    this.originalNumberOfGuests = this.session.booking.guests;
  }

  chooseDate(event) {
    /*let newEvent = {
      start: null,
      end: null,
      title: this.session.user.name + ' with ' + (this.session.booking.guests-1) + ' others',
      color: this.session.booking.status.color
    };
    this.session.booking.event = newEvent;*/
    this.session.booking.event.title = this.session.user.name + ' with ' + 
                                        (this.session.booking.guests-1) + ' others';
    this.navCtrl.push(CalendarPage);
  }

  numberOfGuestsChanged() {
    if (!this.session.booking.isNew()) {
      let confirm = this.alerCtrl.create({
        title: 'Confirm ' + this.session.booking.guests + ' guests?',
        message: 'Do you really want to be ' + this.session.booking.guests + ' people?',
        enableBackdropDismiss: false,            
        buttons: [
          {
            text: 'NO',
            handler: () => {
              this.session.booking.guests = this.originalNumberOfGuests;
            }
          },
          {
            text: 'Yeap',
            handler: () => {
              let subscription = this.bookingService.updateGuests(this.session.booking, this.session.booking.guests)
                .subscribe(
                  () => {
                      this.originalNumberOfGuests = this.session.booking.guests;
                    },
                  (err) => console.error('err ', err)
                );
              this.bookingsSubscriptions.push(subscription);
            }
          }
        ]
      });
      confirm.present()
    }
  }

  getGuestsText() {
    let text;
    if (this.session.booking.isNew()) {
      text = 'Guests'
    } else {
      text = 'Do you want to change number of guests?'
    }
    return text
  }
  getWhenText() {
    let text;
    if (this.session.booking.isNew()) {
      text = 'When'
    } else {
      text = 'Do you want to change period? Now it is from ' +
              this.session.booking.getStartDateFormattedShort() + ' to ' +
              this.session.booking.getEndDateFormattedShort()
    }
    return text
  }
  getPeriodText() {
    let text;
    if (this.session.booking.isNew()) {
      text = 'Choose the period'
    } else {
      text = 'Choose new period'
    }
    return text
  }
  getLeftStyleForGuestStep(step: number) {
    return ((step-1)/(appConfig.maxGuests-1))*95 + "%"
  }

  ngOnDestroy() {
    for(let i = 0; i < this.bookingsSubscriptions.length; i++) {
      this.bookingsSubscriptions[i].unsubscribe();
    }
  }

}
