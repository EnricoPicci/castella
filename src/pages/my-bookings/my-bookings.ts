import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import {Session} from '../../providers/session';
import {BookingsService} from '../../providers/bookings-service';
import {Booking} from '../../model/booking';
import {BookPage} from '../book/book';

/*
  Generated class for the MyBookings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-my-bookings',
  templateUrl: 'my-bookings.html'
})
export class MyBookingsPage implements OnDestroy {
  bookingsSubscriptions = new Array<Subscription>();
  bookings: Array<Booking>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public session: Session,
    public bookingService: BookingsService,
    public loadingCtrl: LoadingController,
    public alerCtrl: AlertController
  ) {}

  ionViewDidLoad() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait while we load your booking'
    });
    loading.present();
    let subscription = this.bookingService.findBookingsByUser(this.session.user)
      .subscribe(
          (bookings) => {
                          loading.dismiss();
                          this.bookings = bookings;
                          this.bookingsSubscriptions.push(subscription);
                        },
          (err) => console.log(err)
      );
  }

  getListHeader() {
    return this.session.user.name + '\'s bookings'
  }
  getBookingDesc(booking: Booking) {
    return booking.duration() + ' days -- ' +
            'From ' + booking.getStartDateFormatted() + 
            ' to ' + booking.getEndDateFormatted() + 
            ' -- ' + booking.guests + ' people'
  }
  getStatusColor(booking: Booking) {
    return booking.getStatusColor()
  }
  getDurationDesc(booking: Booking) {
    return booking.duration() + ' days'
  }
  getDurationPeopleDesc(booking: Booking) {
    return booking.duration() + ' days  -- ' + this.getGuestsDesc(booking)
  }
  getFromToShortDesc(booking: Booking) {
    return booking.getStartDateFormattedShort() + 
            ' - ' + booking.getEndDateFormattedShort()
  }
  getGuestsDesc(booking: Booking) {
    return booking.guests + ' people'
  }
  cancel(booking: Booking) {
    let confirm = this.alerCtrl.create({
      title: 'Confirm cancellation?',
      message: 'Do you really want to cancel this booking?',
      enableBackdropDismiss: false,            
      buttons: [
        {
          text: 'NO',
          handler: () => {}
        },
        {
          text: 'Yeap',
          handler: () => {
            //booking.status = Booking.status.cancelled;
            let subscription = this.bookingService.cancelBooking(booking)
              .subscribe(
                (res) => console.log('Res ', res),
                (err) => console.error('err ', err)
              );
            this.bookingsSubscriptions.push(subscription);
          }
        }
      ]
    });
    confirm.present()
  }
  resume(booking: Booking) {
    let confirm = this.alerCtrl.create({
      title: 'Confirm resume?',
      message: 'Do you really want to resume this booking?',
      enableBackdropDismiss: false,            
      buttons: [
        {
          text: 'NO',
          handler: () => {}
        },
        {
          text: 'Yeap',
          handler: () => {
            //booking.status = Booking.status.pending;
            let subscription = this.bookingService.resumeBooking(booking)
              .subscribe(
                (res) => console.log('Res ', res),
                (err) => console.error('err ', err)
              );
            this.bookingsSubscriptions.push(subscription);
          }
        }
      ]
    });
    confirm.present()
  }
  modify(booking: Booking) {
    let confirm = this.alerCtrl.create({
      title: 'Confirm modify?',
      message: 'Do you really want to modify this booking?',
      enableBackdropDismiss: false,            
      buttons: [
        {
          text: 'NO',
          handler: () => {}
        },
        {
          text: 'Yeap',
          handler: () => {
            this.session.booking = booking;
            this.unsubscribeFirebase();
            this.navCtrl.push(BookPage);
          }
        }
      ]
    });
    confirm.present()
  }

  isSelected(booking: Booking) {
    return this.session.booking && booking.$key == this.session.booking.$key
  }

  unsubscribeFirebase(){
    console.log('destroy MyBookingsPage 1', this.bookingsSubscriptions);
    for(let i = 0; i < this.bookingsSubscriptions.length; i++) {
      this.bookingsSubscriptions[i].unsubscribe();
      console.log('destroy MyBookingsPage 2');
    }
  }

  ngOnDestroy(){
    this.unsubscribeFirebase();
  }

}
