import { Component } from '@angular/core';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import { NavController, NavParams, AlertController } from 'ionic-angular';

import {Auth} from '../../providers/auth';

/*
  Generated class for the Register page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  form:FormGroup;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private fb: FormBuilder,
    private auth: Auth,
    public alerCtrl: AlertController
  ) {
    this.form = this.fb.group({
        name: ['',Validators.required],
        email: ['', [ Validators.required,
                      Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
        password: ['',Validators.required],
        confirm: ['',Validators.required]
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  isFormCorrect() {
      const val = this.form.value;
      return this.form.valid && val && val.password && val.password == val.confirm;
  }

  signUp() {
      const val = this.form.value;

      this.auth.signUp(val.email, val.password)
          .subscribe(
              (user) => {
                console.log('User ', user);
                user.auth.updateProfile({
                  displayName: val.name
                }).then(function(response) {
                  console.log('Dislay name success', response);
                }, function(error) {
                  console.log('Dislay name error', error);
                });
                let confirm = this.alerCtrl.create({
                  title: 'User created',
                  message: 'User ' + val.name + ' created successfully',
                  buttons: [
                    {
                      text: 'OK',
                      handler: () => {
                        this.navCtrl.pop();
                      }
                    }
                  ]
                });
                confirm.present()
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
              },
          );
  }

}
