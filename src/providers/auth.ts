import { Injectable } from '@angular/core';
import {Observable, Subject, BehaviorSubject} from "rxjs/Rx";
import 'rxjs/add/operator/map';
import {FirebaseAuth, FirebaseAuthState} from "angularfire2/index";

import {AuthInfo} from "./auth-info";

/*
  Generated class for the Auth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Auth {
  static UNKNOWN_USER = new AuthInfo(null);
  authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(Auth.UNKNOWN_USER);

  constructor(private auth: FirebaseAuth) {
    console.log('Hello Auth Provider');
  }

  signUp(email, password) {
      return this.fromFirebaseAuthPromise(this.auth.createUser({email, password}));
  }
  login(email, password):Observable<FirebaseAuthState> {
      return this.fromFirebaseAuthPromise(this.auth.login({email, password}));
  }
  logout() {
      this.auth.logout();
      this.authInfo$.next(Auth.UNKNOWN_USER);
  }

  fromFirebaseAuthPromise(promise):Observable<any> {
    const subject = new Subject<any>();
    promise
        .then(res => {
                const authInfo = new AuthInfo(this.auth.getAuth().uid);
                this.authInfo$.next(authInfo);
                subject.next(res);
                subject.complete();
            },
            err => {
                this.authInfo$.error(err);
                subject.error(err);
                subject.complete();
            });
    return subject.asObservable();
  }

}
