declare module "scdl-core" {
    import {Readable} from "stream";

    function scdl(URL: string, options?: object): Readable;

    namespace scdl {
        function setClientID(ID: string): void;
        function setOauthToken(token: string): void;
        function getInfo(URL: string): Promise<object>;
        function downloadFromInfo(info: object, options?: object): Readable;
        function validateURL(URL: string): Boolean;
        function getPermalinkURL(URL: string): string;
    }

    export = scdl;
}
