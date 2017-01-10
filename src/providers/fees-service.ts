import {Injectable, Inject} from '@angular/core';
import {Observable, Subject} from "rxjs/Rx";
import 'rxjs/add/operator/map';
import {AngularFireDatabase, FirebaseRef} from "angularfire2";
import {firebaseConfig} from "../environments/firebase.config";

import {User} from '../model/user';

/*
  Generated class for the FeesService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FeesService {
  sdkDb: any;

  constructor(private db:AngularFireDatabase, 
              @Inject(FirebaseRef) fb) {
    console.log('Hello FeesService Provider');
    this.sdkDb = fb.database().ref();
  }

  findFeePerUser(user: User):Observable<number> {
    // for now we just get the default fee and do not query the user db for specific user fees
      return this.db.list('fees')
              .map(res => {
                let fee;
                if (res && res.length > 0) {
                  fee = res[0].default;
                }
                return fee
              })
              .do(res => console.log('fee', res));
  }

  createFees() {
    const feesToSave = {
      default: 50
    }
    const newFeesKey = this.sdkDb.child('fees').push(feesToSave);
  }

}
