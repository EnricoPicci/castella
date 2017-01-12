import {Injectable, Inject} from '@angular/core';
import {Observable, Subject} from "rxjs/Rx";
import 'rxjs/add/operator/map';
import {AngularFireDatabase, FirebaseRef} from "angularfire2";

import {Booking} from '../model/booking';
import {User} from '../model/user';
import {BookingRecord} from './booking-record';
/*
  Generated class for the BookingsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class BookingsService {
  sdkDb: any;

  constructor(private db:AngularFireDatabase, 
              @Inject(FirebaseRef) fb) {
    console.log('Hello BookingsService Provider');
    this.sdkDb = fb.database().ref();
  }

  findBookingsByMonth(date: Date):Observable<Booking[]> {
    return this.db.list('bookings', {
        query: {
            orderByChild: 'event/start'//,
            //startAt: '',
            //endAt: ''
        }
    })
    .do(res => console.log('bookings list', res))
    .map(res => {return this.bookingsFromJsonList(res)});
  }
  findBookingsByUser(user: User):Observable<Booking[]> {
    return this.db.list('bookings', {
        query: {
            orderByChild: 'userUid',
            equalTo: user.uid,
            //endAt: ''
        }
    })
    .map(res => {return this.bookingsFromJsonList(res)});
  }

  createNewBooking(user: User, booking: Booking): Observable<any> {
    const userUid = user.uid;
    const email = user.email;
    const fee = user.fee;
    const bookingToSave: BookingRecord = {
      event: {start: booking.event.start, end: booking.event.end, title: booking.event.title},
      guests: booking.guests,
      status: {text: booking.status.text},
      userUid: userUid,
      userEmail: email,
      fee: fee
    }

    const newBookingsKey = this.sdkDb.child('bookings').push().key;
    booking.$key = newBookingsKey;  // set to allow the selection of the current booking to work even for newly created bookings
    let dataToSave = {};
    dataToSave["bookings/" + newBookingsKey] = bookingToSave;
    return this.firebaseUpdate(dataToSave);
  }

  updateBooking(booking: Booking): Observable<any> {
    const bookingToUpdate: BookingRecord = {
      event: {start: booking.event.start, end: booking.event.end, title: booking.event.title},
      guests: booking.guests,
      status: {text: booking.status.text},
      userUid: booking.user.uid,
      userEmail: booking.user.email,
      fee: booking.user.fee
    }
    let dataToSave = {};
    dataToSave["bookings/" + booking.$key] = bookingToUpdate;
    return this.firebaseUpdate(dataToSave);
  }

  cancelBooking(booking: Booking) {
    const cancelledStatus = {
        text: 'cancelled'
    }
    return this.updateBookingStatus(booking, cancelledStatus);
  }
  resumeBooking(booking: Booking) {
    const resumeStatus = {
        text: 'pending'
    }
    return this.updateBookingStatus(booking, resumeStatus);
  }
  private updateBookingStatus(booking: Booking, status) {
    let dataToSave = {};
    dataToSave["bookings/" + booking.$key + "/status"] = status;
    return this.firebaseUpdate(dataToSave);
  }

  updateGuests(booking: Booking, newGuests: number) {
    let dataToSave = {};
    dataToSave["bookings/" + booking.$key + "/guests"] = newGuests;
    return this.firebaseUpdate(dataToSave);
  }

  private bookingsFromJsonList(jasonArray): Booking[] {
    return jasonArray.map((jsonObj) => {return this.bookingFromJson(jsonObj)});
  }
  private bookingFromJson(bookingRecord: BookingRecord): Booking {
    const booking = new Booking();
    booking.$key = bookingRecord.$key;
    booking.event = {
                start: new Date(bookingRecord.event.start),
                end: new Date(bookingRecord.event.end),
                title: bookingRecord.event.title,
                color: Booking.status[bookingRecord.status.text].color
            };
    booking.guests = bookingRecord.guests;
    booking.status = Booking.status[bookingRecord.status.text];
    booking.user = new User();
    booking.user.uid = bookingRecord.userUid;
    booking.user.email = bookingRecord.userEmail;
    booking.user.fee = bookingRecord.fee;

    booking.record = bookingRecord;

    return booking;
  }

  private firebaseUpdate(dataToSave) {
    const subject = new Subject();
    this.sdkDb.update(dataToSave)
        .then(
            val => {
                subject.next(val);
                subject.complete();
            },
            err => {
                subject.error(err);
                subject.complete();
            }
        );
    return subject.asObservable();
  }

}
