interface dbFields {
    nid: String;
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
}

interface APIData {
    api: String;
    domain: String;
    dbFields: dbFields;
}

export const SETTING =  {
    database : {
        name : 'church.db',
        location : 'default',
    }
};

export const MAX_FILE_SIZE = 10485760; // in bytes

export const APP_MINIMIZE_LOCK_TIMEOUT_SECONDS = 20;

//  make a new instance of api in below constant.
// api: is API URL
// domain: URL DOMAIN
// dbFields: Please
export const APIs: Array<APIData> = [
    {
        api: 'ruth.savagedns.com/lbc5/rest/views/sermons?_format=json',
        domain: 'ruth.savagedns.com',
        dbFields: {
            nid: 'nid',
            field_artwork: 'field_artwork',
            field_artwork_1: 'field_artwork_1',
            field_channel: 'field_channel',
            field_date: 'field_date',
            field_image: 'field_image',
            field_mp3: 'field_mp3',
            field_photo: 'field_photo',
            field_service: 'field_service',
            field_study_series: 'field_study_series',
            title: 'title',
            title_1: 'title_1'
        }
    }, {
        api: 'Laruebaptist.org/rest/views/sermons?_format=json',
        domain: 'Laruebaptist.org',
        dbFields: {
            nid: 'id',
            field_artwork: 'artworkURL',
            field_artwork_1: 'artworkThumbnailURL',
            field_channel: 'channel',
            field_date: 'date',
            field_image: '',
            field_mp3: 'mediaURL',
            field_photo: 'seriesArtworkURL',
            field_service: 'series',
            field_study_series: 'field_study_series',
            title: 'title',
            title_1: 'author'
        }
    }
];

export const API_CHOOSER: number = 1;