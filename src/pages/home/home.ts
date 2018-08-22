import {Component} from '@angular/core';
import {NavController, PopoverController} from 'ionic-angular';
import {view, ViewsService} from "../../services/views.service";
import {CommonService} from "../../services/common-service";
import {DomSanitizer} from "@angular/platform-browser";
import {EventsService} from "../../services/events.service";
import {FilterPage} from "../filter/filter";

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

    constructor(public navCtrl: NavController,
                private com: CommonService,
                private sanitize: DomSanitizer,
                private eventsService: EventsService,
                private popoverCtrl: PopoverController,
                private viewsProvider: ViewsService) {

    }

    ionViewWillLoad() {
        this.getLatestViews();
    }

    getLatestViews(refresher?) {
        this.pagination.offset = 0;
        this.views = [];
        this.viewsProvider.getViews(this.pagination.row_count, this.pagination.offset)
            .then((res: any) => {
                this.pagination.loadedAll = res.recordEnd;
                this.views = [...this.views, ...res.data];
                this.pagination.offset += res.data.length;
                if (refresher) refresher.complete();
            }).catch((err) => {
            if (refresher) refresher.complete();
        })
    }

    getViewsOffline() {
        return new Promise((resolve => {
            this.viewsProvider.getViewsOffline(this.pagination.row_count, this.pagination.offset)
                .then((res: any) => {
                    if (res.recordEnd) {
                        this.pagination.loadedAll = true;
                    } else {
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
            this.viewsProvider.toggleViewReaded(this.views[index].nid);
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
        let popover = this.popoverCtrl.create('FilterPage', {articles: this.views}, {cssClass: 'filterMenu'});
        popover.present({
            ev: myEvent
        });

        popover.onDidDismiss(data => {
            if (data && data.action == 'reset') {
                // this.refreshPage();
            }
            if (data && data.action == 'filter') {
                // this.filterArticles(data.item, data.value);
            }
        });
    }

    readAll() {
        this.views = this.views.map((view) => {
            view.readed = true;
            return view;
        });
        this.viewsProvider.markAllAsRead()
            .then((res) => {
                console.log('res', res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    }

    unreadAll() {
        this.views = this.views.map((view) => {
            view.readed = false;
            return view;
        });
        this.viewsProvider.markAllAsUnread()
            .then((res) => {
                console.log('res', res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    }
}
