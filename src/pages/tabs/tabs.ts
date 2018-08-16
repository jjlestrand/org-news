import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams, Tabs} from 'ionic-angular';
import {HomePage} from "../home/home";

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage {

    @ViewChild('tabs') tabs: Tabs;

    tabData = [
        { name: 'Home', component: HomePage },
        { name: 'About', component: '' },
        { name: 'Contanct', component: '' }
    ];

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidEnter() {
        console.log('this.tabRef', this.tabs);
        this.tabs.select(0);
    }
}
