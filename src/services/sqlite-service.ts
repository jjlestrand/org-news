import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Platform} from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {SETTING} from "../config/setting";

declare var window: any;

@Injectable()
export class SqliteService {
    database_name: string = SETTING.database.name;
    location: string = SETTING.database.location;
    db: SQLiteObject;

    connection: boolean = false;

    constructor(public sqlite: SQLite, public  platform: Platform) {

    }

    bulkInsertExecute(batchQuery) {
        if (this.platform.is('cordova')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: this.database_name,
                    location: this.location
                }).then((db: SQLiteObject) => {
                    db.sqlBatch(batchQuery)
                        .then((result: any) => {
                            resolve({result: result, status: true, message: 'query executed'});
                        })
                        .catch((err) => {
                            reject({result: [], status: false, err: err, message: 'query execution fail!'})
                        });
                }).catch(e => {
                    reject({result: [], status: false, message: 'database not found!'})
                });
            });

        } else {
            return this.bulkInsertObservable(batchQuery).toPromise();
        }
    }

    bulkInsertObservable(batchQuery) {
        return Observable.create((observer) => {
            let db = window.openDatabase(this.database_name, '1.0', 'database', 5 * 1024 * 1024);
            db.transaction((tx) => {
                let i = 0;
                let totalQueries = batchQuery.length;
                let isComplete = (executeSuccess, insertId = null) => {
                    observer.next({
                        insertId: insertId,
                        status: executeSuccess,
                        due_queries: (totalQueries - i),
                        excecuted_query: batchQuery.length - (totalQueries - i),
                        error: i
                    });
                    if (totalQueries <= 0 || (totalQueries - i) <= 0) {
                        observer.complete();
                    }
                };

                batchQuery.forEach((item) => {
                    tx.executeSql(item[0], item[1], (ignored, resultSet: any) => {
                        totalQueries--;
                        isComplete(true);
                    }, (err) => {
                        console.log('sql query err', err);
                        i++;
                        isComplete(false);
                    });
                });
            }, (err) => {
                console.log('Trasaction error', err);
            });
        });
    }

    select(query, params = []) {
        return new Promise((resolve, reject) => {
            if (this.platform.is("cordova")) {
                this.sqlite.create({
                    name: this.database_name,
                    location: this.location
                }).then((db: SQLiteObject) => {
                    db.executeSql(query, params)
                        .then((resultSet) => {
                            let data = [];
                            for (let x = 0; x < resultSet.rows.length; x++) {
                                data.push(resultSet.rows.item(x));
                            }
                            const response = {results: data, counts: data.length, message: 'query executed'};
                            resolve(response);
                        })
                        .catch((e) => {
                            reject({errors: e, results: [], message: 'query execution fail!'});
                        });
                }).catch((e) => reject({errors: e, results: [], message: 'database not found!'}));
            } else {
                let db = window.openDatabase(this.database_name, '1.0', 'database', 5 * 1024 * 1024);
                db.transaction(function (tx) {
                    // console.log(query,params);
                    tx.executeSql(query, params, (ignored, resultSet) => {
                        let data = [];
                        for (let x = 0; x < resultSet.rows.length; x++) {
                            data.push(resultSet.rows.item(x));
                        }
                        resolve({results: data, counts: data.length, message: 'query executed'});
                    }, (error) => {
                        // console.log('error', error, {query: query, params: params});
                        reject({errors: error, results: [], message: 'query execution fail!'});
                    });

                });

            }
        });
    }
}