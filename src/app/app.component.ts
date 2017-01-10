import { Component, ViewChild } from '@angular/core';

import { Platform, MenuController, Nav, NavController } from 'ionic-angular';

import { StatusBar, Splashscreen } from 'ionic-native';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { ListPage } from '../pages/list/list';

import {HelloCastellammarePage} from '../pages/hello-castellammare/hello-castellammare';
import {BookPage} from '../pages/book/book';
import {MyBookingsPage} from '../pages/my-bookings/my-bookings';
import {LogoffPage} from '../pages/logoff/logoff';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild(Nav) navCtrl: NavController;
  rootPage: any = HelloCastellammarePage;
  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public menu: MenuController
  ) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Hello Castella', component: HelloCastellammarePage },
      { title: 'Book', component: BookPage },
      { title: 'My Bookings', component: MyBookingsPage },
      { title: 'Logoff', component: LogoffPage }
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    if (this.navCtrl.first().component !== page.component) {
      this.nav.setRoot(page.component);
    }
  }
}
