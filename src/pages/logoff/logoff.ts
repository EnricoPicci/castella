import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {Auth} from '../../providers/auth';
import {Session} from '../../providers/session';
import {HelloCastellammarePage} from '../hello-castellammare/hello-castellammare';

/*
  Generated class for the Logoff page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-logoff',
  templateUrl: 'logoff.html'
})
export class LogoffPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private auth: Auth,
    private session: Session
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogoffPage');
  }

  logoff() {
    this.session.user = null;
    this.auth.logout();
    this.navCtrl.setRoot(HelloCastellammarePage);
  }

}
