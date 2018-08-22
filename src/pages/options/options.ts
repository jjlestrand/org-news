import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';


@IonicPage()
@Component({
    selector: 'page-options',
    templateUrl: 'options.html',
})
export class OptionsPage {
    text: string;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private viewCtrl: ViewController) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad OptionsPage');
        this.text = "HELLO WORLD";
    }

    markAll(action) {
        if (action == 'read') {
            this.dismiss('read');
        } else if (action == 'unread') {
            this.dismiss('unread');
        } else {
            console.log("optionsPage markAll");
            console.log("markAll() called without valid action");
            this.cancel();
        }
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    dismiss(action) {
        //console.log("filter dismiss action: " + action);
        //console.log("filter dismiss item: " + item);
        this.viewCtrl.dismiss({action: action});
    }
}
