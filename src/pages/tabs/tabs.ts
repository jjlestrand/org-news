import {Component, ViewChild} from '@angular/core';
import {Events, NavController, NavParams, Tabs} from 'ionic-angular';
import {HomePage} from "../home/home";
import {GlobalEventPayload} from "../../app/app.component";
import {AboutPage} from "../about/about";

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage {

    @ViewChild('tabs') tabs: Tabs;

    pages = {
        homepage: <any>HomePage,
        aboutpage: <any>AboutPage
    };

    tabData = [
        { name: 'Home', component: this.pages.homepage, componentName: 'HomePage' },
        { name: 'About', component: this.pages.aboutpage, componentName: 'AboutPage' },
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
