import {Injectable} from "@angular/core";
import {CommonService} from "./common-service";
import {HttpClient} from "@angular/common/http";
import {SqliteService} from "./sqlite-service";
import {Environment} from "../environment/environment";
import {MigrationService} from "./migration-service";

export class view {
    nid: number;
    field_artwork: string;
    field_artwork_1: string;
    field_channel: string;
    field_date: string;
    field_image: string;
    field_mp3: string;
    field_photo: string;
    field_service: string;
    field_study_series: string;
    title: string;
    title_1: string;
    last_play_duration: number;
    favorite: boolean;
    readed: boolean;
}

@Injectable()

export class ViewsService {

    constructor(private com: CommonService,
                private http: HttpClient,
                private migrationService: MigrationService,
                private sqliteService: SqliteService) {

    }

    getViews(row_count, offset) {
        return new Promise((async (resolve, reject) => {
            let onLineRes: any;
            try {
                onLineRes = await this.getViewsOnline();
            } catch (e) {
                reject(e);
            }
            // await this.removeAllExceptFavorited();
            let storeRes = await this.storeAllDataOffline(onLineRes);
            let query = 'select * from views LIMIT ' + row_count + ' OFFSET ' + offset;
            let recordCount: any = await this.sqliteService.select('select count(*) from views');
            recordCount = recordCount.results[0]['count(*)'] || false;
            try {
                let records: any = await this.sqliteService.select(query);
                if (records) {
                    resolve({recordEnd: (offset + row_count) > recordCount, data: records.results})
                }
            } catch (e) {
                reject(e);
            }
        }))
    }

    updateView(nId, data) {
        return new Promise((resolve, reject) => {

        });
    }

    storeAllDataOffline(data) {
        return new Promise(((resolve, reject) => {
            this.migrationService.viewsTable(data)
                .then((res: any) => {
                    this.sqliteService.bulkInsertExecute(res.result)
                        .then((res) => resolve({status: true, data: res}))
                        .catch((err) => resolve({status: false, err: err}))
                })
                .catch((err) => resolve({status: false, err: err}));
        }));
    }

    private getViewsOnline() {
        return new Promise((resolve, reject) => {
            let url = Environment.API_URL + 'views/sermons?_format=json';
            this.http.get(url)
                .subscribe((res) => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }

    removeAllExceptFavorited() {
        let query = ['delete from views where favorite=?', [0]];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    getViewsOffline(row_count = 0, offset = 0) {
        return new Promise(async (resolve, reject) => {
            let query =
                row_count ?
                    'select * from views limit ' + row_count + ' offset ' + offset :
                    'select * from views';
            let recordCount: any = await this.sqliteService.select('select count(*) from views');
            recordCount = recordCount.results[0]['count(*)'] || false;
            if (recordCount > offset) {
                this.sqliteService.select(query)
                    .then((res: any) => {
                        resolve({recordEnd: false, data: res.results})
                    })
                    .catch((err) => {
                        reject(err);
                    })
            } else {
                resolve({recordEnd: true, data: []})
            }
        });
    }

    removeView(nId) {
        let query = ['delete from views where nid=?', [nId]];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    toggleFavourite(nId) {
        let query = ['update views set favorite = NOT favorite where nid=?', [nId]];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    setViewReaded(nId) {
        let query = ['update views set readed = 1 where nid=?', [nId]];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    markAllAsRead() {
        let query = ['update views set readed = 1', []];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    markAllAsUnread() {
        let query = ['update views set readed = 0', []];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    getAllFavorited() {
        let query = 'select * from views where favorite = 1';
        return this.sqliteService.select(query);
    }

    getAllUnReaded() {
        let query = 'select * from views where readed = 0';
        return this.sqliteService.select(query);
    }

    getChannelWise(channel_name) {
        let query = 'select * from views where field_channel = ' + channel_name;
        return this.sqliteService.select(query);
    }

    setPlayDuration(nid, playerDuration) {
        let query = ['update views set last_play_duration=? where nid=?', [parseInt(playerDuration), nid]];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    getLastPlayDuration(nid) {
        return new Promise((resolve => {
            let query = 'select last_play_duration from views where nid = ' + nid;
            this.sqliteService.select(query)
                .then((res: any) => resolve(res.results[0].last_play_duration || 0))
                .catch((err) => resolve(0));
        }))
    }
}