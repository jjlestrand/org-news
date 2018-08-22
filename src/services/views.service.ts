import {Injectable} from "@angular/core";
import {CommonService} from "./common-service";
import {HttpClient} from "@angular/common/http";
import {SqliteService} from "./sqlite-service";
import {Environment} from "../environment/environment";
import {MigrationService} from "./migration-service";
import {Observable} from "rxjs/Observable";

export class view {
    nid: number;
    field_artwork: String;
    field_artwork_1: String;
    field_channel: String;
    field_date: String;
    field_image: String;
    field_mp3: String;
    field_photo: String;
    field_service: String;
    field_study_series: String;
    title: String;
    title_1: String;
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
            try {
                const onLineRes: any = await this.getViewsOnline();
                // await this.removeAllExceptFavorited();
                await this.storeAllDataOffline(onLineRes);
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
                        .then((res) => resolve(res))
                        .catch((err) => reject(err))
                })
                .catch((err) => reject(err));
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
            if (row_count) {
                let query = 'select * from views limit ' + row_count + ' offset ' + offset;
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
            } else {
                resolve([]);
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

    toggleViewReaded(nId) {
        let query = ['update views set readed = NOT readed where nid=?', [nId]];
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
}