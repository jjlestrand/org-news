import {Injectable} from "@angular/core";
import {CommonService} from "./common-service";
import {HttpClient} from "@angular/common/http";
import {SqliteService} from "./sqlite-service";
import {Environment} from "../environment/environment";
import {MigrationService, viewsTableFields} from "./migration-service";
import {NetworkProvider} from "./network.service";
import {API_CHOOSER, APIs} from "../config/setting";

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

    api_fields: any;

    constructor(private com: CommonService,
                private http: HttpClient,
                private migrationService: MigrationService,
                private networkProvider: NetworkProvider,
                private sqliteService: SqliteService) {
        this.api_fields = APIs[API_CHOOSER].dbFields;
    }

    getViews(row_count, offset) {
        return new Promise((async (resolve, reject) => {

            if (this.networkProvider.isOnlineMode()) {
                let onLineRes: any;
                try {
                    onLineRes = await this.getViewsOnline();
                } catch (e) {
                    reject(e);
                }

                if (onLineRes) { // removes and stores new if onlineData get
                    try {
                        await this.removeAllExceptReadAndFavorited();
                        let storeRes = await this.storeAllDataOfflineUpdateExisted(onLineRes);
                    } catch (e) {

                    }
                }
            }
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

    storeAllDataOfflineUpdateExisted(data) {
        return new Promise((async (resolve, reject) => {
            let ids: any;
            let insertQuery: any;
            let batchQuery: any;
            try {
                ids = await this.getIds(); // getting all the record ids from local
                ids = ids.results;
                ids = ids.map((ids) => {
                    return ids.nid
                });
            } catch (e) {
            }

            try {
                if (!ids || !ids.length) {
                    let tempResp: any = await this.migrationService.viewsTable(data);
                    batchQuery = tempResp.result;

                    this.sqliteService.bulkInsertExecute(batchQuery)
                        .then((res) => resolve({status: true, data: res}))
                        .catch((err) => resolve({status: false, err: err}))

                } else if (ids && ids.length) {
                    let offlineData = data.filter((record) => ids.indexOf(parseInt(record[this.api_fields.nid])) != -1);
                    let onlineData = data.filter((record) => ids.indexOf(parseInt(record[this.api_fields.nid])) == -1);
                    insertQuery = await this.migrationService.viewsTable(onlineData);
                    batchQuery = insertQuery.result;
                    // update existed
                    if (offlineData.length) {
                        let updateQuery: any = await this.updateTheExisted(offlineData);
                        batchQuery = [...batchQuery, ...updateQuery];
                    }

                    this.sqliteService.bulkInsertExecute(batchQuery)
                        .then((res) => resolve({status: true, data: res}))
                        .catch((err) => resolve({status: false, err: err}))
                }
            } catch (e) {
                console.log('catched eeee', e)
            }

            // let batchQuery: Array<any> = insertQuery.result;

            // resolve();
            // .then((res: any) => {
            //     this.sqliteService.bulkInsertExecute(res.result)
            //         .then((res) => resolve({status: true, data: res}))
            //         .catch((err) => resolve({status: false, err: err}))
            // })
            // .catch((err) => resolve({status: false, err: err}));
        }));
    }

    getIds() {
        let query = 'select nid from views';
        return this.sqliteService.select(query);
    }

    private getViewsOnline() {
        return new Promise((resolve, reject) => {
            let url = Environment.API_URL;
            this.http.get(url)
                .subscribe((res) => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                });
        });
    }

    private updateTheExisted(data) { // just a static func
        return new Promise(((resolve, reject) => {
            let query = [];
            data.map((rec) => {
                let UPDATE_QUERY: string = 'UPDATE views set ';
                let params = [];
                viewsTableFields.map((field) => {
                    if (rec.hasOwnProperty(field.name)) {
                        let extendQuery = field.name + '=?,';
                        UPDATE_QUERY += extendQuery;
                        params.push(rec[field.name]);
                    }
                });
                UPDATE_QUERY = UPDATE_QUERY.slice(0, -1); // remove last character
                UPDATE_QUERY += ' where nid=?';
                params.push(rec.nid);
                query.push([UPDATE_QUERY, params]);
            });
            console.log('query', query);
            resolve(query);

            // return this.sqliteService.bulkInsertExecute(query);

        }));
    }

    removeAllExceptReadAndFavorited() {
        let query = [`delete from views where favorite=? AND readed=?`, [0, 0]];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    getViewsOffline(row_count = 0, offset = 0) {
        return new Promise(async (resolve, reject) => {
            let query =
                row_count ?
                    'select * from views limit ' + row_count + ' offset ' + offset :
                    'select * from views';
            let recordCount: any;
            try {
                recordCount = await this.sqliteService.select('select count(*) from views');
            } catch (e) {
            }
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

    removeAllView() {
        let query = ['delete from views where 1=1', []];
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
        let query = [`update views set readed = 1`, []];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    markAllAsUnread() {
        let query = [`update views set readed = 0`, []];
        return this.sqliteService.bulkInsertExecute([query]);
    }

    getAllFavorited() {
        let query = `select * from views where favorite = 1`;
        return this.sqliteService.select(query);
    }

    getAllUnReaded() {
        let query = `select * from views where readed = 0`;
        return this.sqliteService.select(query);
    }

    getChannelWise(channel_name) {
        let query = `select * from views where field_channel = '${channel_name}'`;
        console.log('query', query)
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