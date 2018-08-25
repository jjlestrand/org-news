import {Component} from '@angular/core';
import {NavController, PopoverController} from 'ionic-angular';
import {view, ViewsService} from "../../services/views.service";
import {CommonService} from "../../services/common-service";
import {DomSanitizer} from "@angular/platform-browser";
import {EventsService} from "../../services/events.service";
import {FilterPage} from "../filter/filter";
import {Environment} from "../../environment/environment";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})

export class HomePage {
    views: Array<view> = [];
    pagination = {
        totalScrollPages: 0,
        row_count: 2,
        offset: 0,
        loadedAll: false
    };
    filterType = 'All';
    domain: String;

    constructor(public navCtrl: NavController,
                private com: CommonService,
                private sanitize: DomSanitizer,
                private eventsService: EventsService,
                private popoverCtrl: PopoverController,
                private viewsProvider: ViewsService) {
        this.domain = Environment.DOMAIN;
    }

    ionViewWillLoad() {
        this.getLatestViews();
    }

    getLatestViews(refresher?) {
        this.pagination.offset = 0;
        this.views = [];
        this.viewsProvider.getViews(this.pagination.row_count, this.pagination.offset)
            .then((res: any) => {
                console.log('res', res);
                this.pagination.loadedAll = res.recordEnd;
                this.views = [...this.views, ...res.data];
                this.pagination.offset += res.data.length;
                if (refresher) refresher.complete();
            }).catch((err) => {
            alert('err => ' + JSON.stringify(err));
            if (refresher) refresher.complete();
        })
    }

    getViewsOffline(reset = false) {
        return new Promise((resolve => {
            this.viewsProvider.getViewsOffline(this.pagination.row_count, this.pagination.offset)
                .then((res: any) => {
                    this.views = reset ? [] : this.views;
                    this.pagination.loadedAll = res.recordEnd;
                    if (!this.pagination.loadedAll) {
                        this.views = [...this.views, ...res.data];
                        this.pagination.offset += res.data.length;
                    }
                    resolve();
                })
        }));
    }

    async doInfinite(infinteScroll?) {
        await this.getViewsOffline();
        infinteScroll.complete();
    }

    toggleFavourite(index) {
        this.views[index].favorite = !this.views[index].favorite;
        this.viewsProvider.toggleFavourite(this.views[index].nid)
            .catch(() => {
                this.views[index].favorite = !this.views[index].favorite;
            });
    }

    goToDetail(event, index) {
        if (this.com.parentHasClass(event, 'favourite_btn')) {
            event.stopPropagation();
        } else {
            this.views[index].readed = true;
            this.viewsProvider.setViewReaded(this.views[index].nid);
            this.eventsService.sendPageRedirectEvent('ArticlePage', {article: this.views[index]});
        }
    }

    sanitizeHtml(text) {
        return this.sanitize.bypassSecurityTrustScript(text);
    }

    optionsMenuPopover(myEvent) {
        let popover = this.popoverCtrl.create('OptionsPage');
        popover.present({
            ev: myEvent
        });
        popover.onDidDismiss(data => {
            if (data && data.action == 'read') {
                this.readAll();
            } else if (data && data.action == 'unread') {
                this.unreadAll();
            }
        });
    }

    filterMenuPopover(myEvent) {

        let popover = this.popoverCtrl.create('FilterPage', {articles: this.views});
        popover.present({
            ev: myEvent
        });

        popover.onDidDismiss(data => {
            if (data && data.action && data.item) {
                this.getViewsFiltered(data.action, data.item);
            }
        });
    }

    getViewsFiltered(action, item) {
        if (action == 'reset') {
            this.pagination.offset = 0;
            this.getViewsOffline(true);
        } else if (action == 'filter' && item == 'favorite') {
            this.viewsProvider.getAllFavorited()
                .then((res: any) => {
                    if (res.results && res.results.length > 0) {
                        this.views = res.results;
                    } else {
                        this.com.toastMessage('No any records found with these filter');
                    }
                })
                .catch((err) => this.com.toastMessage('Error Filter'));
        } else if (action == 'filter' && item == 'unread') {
            this.viewsProvider.getAllUnReaded()
                .then((res: any) => {
                    if (res.results && res.results.length > 0) {
                        this.views = res.results;
                    } else {
                        this.com.toastMessage('No any records found with these filter');
                    }
                })
                .catch((err) => this.com.toastMessage('Error Filter'));
        } else if (action == 'channel') {
            this.viewsProvider.getChannelWise(item)
                .then((res: any) => {
                    if (res.results && res.results.length > 0) {
                        this.views = res.results;
                    } else {
                        this.com.toastMessage('No any records found with these filter');
                    }
                })
                .catch((err) => this.com.toastMessage('Error Filter'));
        }
    }

    readAll() {
        this.views = this.views.map((view) => {
            view.readed = true;
            return view;
        });
        this.viewsProvider.markAllAsRead();
    }

    unreadAll() {
        this.views = this.views.map((view) => {
            view.readed = false;
            return view;
        });
        this.viewsProvider.markAllAsUnread();
    }
}
