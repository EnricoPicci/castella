import {AuthMethods, AuthProviders} from "angularfire2";

export const firebaseConfig = {
    apiKey: "AIzaSyCby9uu9nyhz-KHGhMYJMgmAtA-cihYjIs",
    authDomain: "castella-e7d02.firebaseapp.com",
    databaseURL: "https://castella-e7d02.firebaseio.com",
    storageBucket: "castella-e7d02.appspot.com",
    messagingSenderId: "245193330774"
};



export const authConfig = {
    provider: AuthProviders.Password,
    method: AuthMethods.Password
};