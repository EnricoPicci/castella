import { Component, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Subscription} from "rxjs/Rx";
import { NavController, NavParams, AlertController } from 'ionic-angular';

import {Session} from '../../providers/session';
import {Auth} from '../../providers/auth';
import {FeesService} from '../../providers/fees-service';
import {User} from '../../model/user';
import {RegisterPage} from '../register/register';
import {appConfig} from '../../app/app.config';

/*
  Generated class for the HelloCastellammare page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-hello-castellammare',
  templateUrl: 'hello-castellammare.html'
})
export class HelloCastellammarePage implements OnDestroy {
  slides = [
    {
      image: "assets/imgs/Castellammare.png"
    },
    {
      image: "assets/imgs/IMG_4763.jpg"
    },
    {
      image: "assets/imgs/IMG_4766.jpg"
    }
  ];
  slideOptions = {
    autoplay: 2000,
    loop: true,
    speed: 1000
  };

  form:FormGroup;

  feesSubscription: Subscription;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private session: Session,
    private auth: Auth,
    public alerCtrl: AlertController,
    public feesService: FeesService
  ) {
      this.form = this.formBuilder.group({
                    email: ['', [
                            Validators.required,
                            Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
                            ]],
                    password: ['', Validators.required]
                  })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelloCastellammarePage');
  }

  onSubmit(formData) {
    const formValue = this.form.value;
    this.auth.login(formValue.email, formValue.password)
      .subscribe(
          (loginData) => {
            const user = new User();
            user.name = loginData.auth.displayName;
            user.email = loginData.auth.email;
            user.uid = loginData.uid;
            this.session.user = user;
            this.feesSubscription = this.feesService.findFeePerUser(user)
              .subscribe(fee => {
                let _fee = fee;
                if (!_fee) {
                  _fee = appConfig.defaultFee;
                }
                user.fee = _fee;
                this.navCtrl.setRoot(HelloCastellammarePage);
              });
          },
          (error) => {
            let confirm = this.alerCtrl.create({
              title: 'Error',
              message: error,
              buttons: [
                {
                  text: 'OK'
                }
              ]
            });
            confirm.present()
          }
      );
  }

  register() {
    this.navCtrl.push(RegisterPage);
  }

  ngOnDestroy(){
    if (this.feesSubscription) {
      this.feesSubscription.unsubscribe();
    }
  }

}
