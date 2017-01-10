import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import {User} from '../model/user';
import {Booking} from '../model/booking';

/*
  Generated class for the Session provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Session {
  user: User;
  booking: Booking;

  constructor() {
    console.log('Hello Session Provider');
  }

}
