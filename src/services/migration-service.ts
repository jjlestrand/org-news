import {Injectable, NgZone} from '@angular/core';
import 'rxjs/add/operator/map';
import {SqliteService} from "./sqlite-service";
import {API_CHOOSER, APIs} from "../config/setting";

export const viewTable = [
    {name: 'nid', type: 'INTEGER', nullable: false, primaryKey: true},
    {name: 'field_artwork', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_artwork_1', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_channel', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_date', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_image', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_mp3', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_photo', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_service', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'field_study_series', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'title', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'title_1', type: 'TEXT', nullable: false, primaryKey: false},
    {name: 'last_play_duration', type: 'INTEGER', nullable: false, primaryKey: false},
    {name: 'favorite', type: 'INTEGER', nullable: false, primaryKey: false},
    {name: 'readed', type: 'INTEGER', nullable: false, primaryKey: false}
];

@Injectable()
export class MigrationService {

    public viewsTableFields: Array<any> = [];
    current_db_fields: any;

    constructor(private sqliteService: SqliteService) {

        this.current_db_fields = APIs[API_CHOOSER].dbFields;
        for (let field of viewTable) {
            let fieldName = this.current_db_fields[field.name] || field.name;
            this.viewsTableFields.push({...field, fieldName: fieldName});
        }
    }

    tables() {
        return {
            'views': this.viewsTable,
            // 'clients' : this.clientsTable,
        }
    }

    getViewTableFields() {
        return this.viewsTableFields;
    }

    run() {
        return new Promise(async (resolve) => {
            let logs = {};
            const tables = this.tables();
            const tableNames = Object.keys(tables);
            // for (let i = 0; i < tableNames.length; i++) {
            //     let callbackResponse = await tables[tableNames[i]]();
            //     console.log('callbackResponse', callbackResponse);
            //     if (callbackResponse.result.length > 0) {
            //         try {
            //             let table_create_insert_response = await this.sqliteService.bulkInsertExecute(callbackResponse.result);
            //             logs[tableNames[i]] = true
            //         } catch (e) {
            //             logs[tableNames[i]] = false
            //         }
            //     }
            // }
            let batchQuery = [];
            let viewTableRes: any = await this.viewsTable();
            batchQuery = [...batchQuery, ...viewTableRes.result];
            let queryRes = await this.sqliteService.bulkInsertExecute(batchQuery);
            resolve({
                logs: logs
            });

        });
    }

    viewsTable(records = null) {
        return new Promise((resolve, reject) => {
            let $batchQuery = [];
            /* making create table query */
            let CREATE_TABLE_QUERY: string = 'CREATE TABLE IF NOT EXISTS views ( ';
            this.viewsTableFields.map((field) => {
                let extendQuery = field.fieldName + ' ' + field.type + (field.primaryKey ? ' PRIMARY KEY' : '') + ',';
                CREATE_TABLE_QUERY += extendQuery;
            });
            CREATE_TABLE_QUERY = CREATE_TABLE_QUERY.slice(0, -1);
            CREATE_TABLE_QUERY += ')';
            /* create table query ready */

            /* table field values array and string */
            let columnsStringArr = this.viewsTableFields.filter((field) => {
                return field.fieldName;
            }).map((field) => {
                return field.fieldName
            });
            let columnsString = columnsStringArr.toString();
            $batchQuery.push([CREATE_TABLE_QUERY, []]);
            /* if record, inserting */

            if (records) {
                let columnsValueArr = [];
                let string = [];
                string = [];
                records.map((record) => {
                    columnsStringArr.map((field) => {
                        if (field == this.current_db_fields.nid) {
                            columnsValueArr.push(record[field] ? Number(record[field]) : '');
                        } else if (field == 'favorite' || field == 'readed') {
                            columnsValueArr.push(record[field] == 'true' ? 1 : 0);
                        } else if (field == 'last_play_duration') {
                            columnsValueArr.push(record[field] ? record[field] : 0);
                        } else {
                            columnsValueArr.push(record[field] ? record[field] : '');
                        }
                        string.push('?');
                    });
                    let insertQuery = ['INSERT INTO views (' + columnsString + ') values(' + string.join(',') + ')', columnsValueArr];
                    $batchQuery.push(insertQuery);
                    columnsValueArr = [];
                    string = [];
                });
                console.log('$batchQuery', $batchQuery);
            }
            resolve({
                message: 'done',
                status: true,
                result: $batchQuery,
                error: null
            });
        });
    }
}