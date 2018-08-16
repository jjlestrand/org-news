import {Injectable} from "@angular/core";
import {CommonService} from "./common-service";
import {HttpClient} from "@angular/common/http";
import {SqliteService} from "./sqlite-service";
import {Environment} from "../environment/environment";
import {MigrationService} from "./migration-service";

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
}

@Injectable()

export class ViewsService {
    constructor(private com: CommonService,
                private http: HttpClient,
                private migrationService: MigrationService,
                private sqliteService: SqliteService) {

    }

    getViews() {
        return new Promise((async (resolve, reject) => {
            if (this.com.isOnlineMode()) {
                this.getViewsOnline()
                    .then((res) => {
                        this.storeAllDataOffline(res);
                    });
            }

            this.getViewsOffline()
                .then((res: any) => {
                    if (!res.length) {
                        this.getViewsOnline()
                            .then((res) => {
                                resolve(res);
                            })
                            .catch((err) => {
                                resolve([]);
                            })
                    } else {
                        resolve(res);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        }))
    }

    storeAllDataOffline(data) {
        return new Promise(((resolve, reject) => {
            this.migrationService.viewsTable(data)
                .then((res: any) => {
                    this.sqliteService.bulkInsertExecute(res.result)
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                })
                .catch((err) => {
                    reject(err);
                });
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

    private getViewsOffline() {
        return new Promise((resolve, reject) => {
            let query = 'select * from views';
            this.sqliteService.select(query)
                .then((res: any) => {
                    resolve(res.results);
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }
}