import { NgModule, ErrorHandler } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
 import { ResponsiveModule, ResponsiveConfig, ResponsiveConfigInterface } from 'ng2-responsive';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from "../environments/firebase.config";
import { CalendarModule, CalendarEventTitleFormatter } from 'angular-calendar';
import { CustomEventTitleFormatter } from '../pages/calendar/custom-title-formatter.provider';

import { MyApp } from './app.component';
import {HelloCastellammarePage} from '../pages/hello-castellammare/hello-castellammare';
import {BookPage} from '../pages/book/book';
import {CalendarPage} from '../pages/calendar/calendar';
import {MyBookingsPage} from '../pages/my-bookings/my-bookings';
import {LogoffPage} from '../pages/logoff/logoff';
import {RegisterPage} from '../pages/register/register';

import {Session} from '../providers/session';
import {Auth} from '../providers/auth';
import {BookingsService} from '../providers/bookings-service';
import {FeesService} from '../providers/fees-service';

let config: ResponsiveConfigInterface = {
    breakPoints: {
            xs: {max: 600},
            sm: {min: 601, max: 959},
            md: {min: 960, max: 1279},
            lg: {min: 1280, max: 1919},
            xl: {min: 1920}
    },
    debounceTime: 100 // allow to debounce checking timer
 };

@NgModule({
  declarations: [
    MyApp,
    HelloCastellammarePage,
    BookPage,
    CalendarPage,
    MyBookingsPage,
    LogoffPage,
    RegisterPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    CalendarModule.forRoot(),
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig, authConfig),
    ResponsiveModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloCastellammarePage,
    BookPage,
    CalendarPage,
    MyBookingsPage,
    LogoffPage,
    RegisterPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Session,
    Auth,
    BookingsService,
    FeesService,
    {provide: CalendarEventTitleFormatter, useClass: CustomEventTitleFormatter},
    {provide: ResponsiveConfig, useFactory: () => new ResponsiveConfig(config) }
  ]
})
export class AppModule {}
