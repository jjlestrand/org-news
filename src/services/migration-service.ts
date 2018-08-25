import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {SqliteService} from "./sqlite-service";

export const viewsTableFields = [
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

    constructor(private sqliteService: SqliteService) {
    }

    tables() {
        return {
            'views': this.viewsTable,
            // 'clients' : this.clientsTable,
        }
    }

    run() {
        return new Promise(async (resolve) => {
            let logs = {};
            const tables = this.tables();
            const tableNames = Object.keys(tables);

            for (let i = 0; i < tableNames.length; i++) {
                let callbackResponse = await tables[tableNames[i]]();
                if (callbackResponse.result.length > 0) {
                    try {
                        let table_create_insert_response = await this.sqliteService.bulkInsertExecute(callbackResponse.result);
                        logs[tableNames[i]] = true
                    } catch (e) {
                        logs[tableNames[i]] = false
                    }
                }
            }

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
            viewsTableFields.map((field) => {
                let extendQuery = field.name + ' ' + field.type + (field.primaryKey ? ' PRIMARY KEY' : '') + ',';
                CREATE_TABLE_QUERY += extendQuery;
            });
            CREATE_TABLE_QUERY = CREATE_TABLE_QUERY.slice(0, -1);
            CREATE_TABLE_QUERY += ')';
            /* create table query ready */

            /* table field values array and string */
            let columnsStringArr = viewsTableFields.filter((field) => {
                return field.name;
            }).map((field) => {
                return field.name
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
                        if (field == 'nid') {
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