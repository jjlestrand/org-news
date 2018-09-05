import {Component, ViewChild} from '@angular/core';
import {Events, NavController, NavParams, Tabs} from 'ionic-angular';
import {HomePage} from "../home/home";
import {GlobalEventPayload} from "../../app/app.component";

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage {

    @ViewChild('tabs') tabs: Tabs;

    tabData = [
        { name: 'Home', component: HomePage, componentName: 'HomePage' },
        { name: 'About', component: '', componentName: '' },
        { name: 'Contanct', component: '', componentName: '' }
    ];

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private event: Events) {

    }

    ionViewDidLoad() {
        this.event.subscribe('global:event', (payload: GlobalEventPayload) => {
            if (payload.type == 'tab:redirect') {
                console.log('tab:redirect event catched.!', payload.data);
                this.tabChange(payload.data.page_name, payload.data.param);
            }
        });
    }

    ionViewDidEnter() {
        console.log('this.tabRef', this.tabs);
        this.tabs.select(0);
    }

    tabChange(pageName, params) {
        console.log('tab change');
        this.tabData.map((tab, index) => {
            if (tab.componentName == pageName) {
                this.tabs.select(index);
            }
        });
    }
}
