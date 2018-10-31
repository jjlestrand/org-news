import {API_CHOOSER, APIs} from "../config/setting";

const DOMAIN:String = APIs[API_CHOOSER].domain;
const API: String = APIs[API_CHOOSER].api;
export const Environment = {
    API_URL: `https://${API}`,
    API_VERSION: `v1.0.0`,
    DOMAIN: `https://${DOMAIN}/`
};