const fetch = require('node-fetch');
const fs = require('fs');

class Cache {

    static cache_meta = null;
    static cache_path = null;

    static {
        let file_exists = fs.existsSync("./src/cache/cache_meta.json");
        if (file_exists) {
            this.cache_meta = JSON.parse(fs.readFileSync("./src/cache/cache_meta.json", "utf8"));
            this.cache_path = JSON.parse(fs.readFileSync("./src/cache/cache_path.json", "utf8"));

            console.log("Loaded cache from file. Length of loaded caches: Meta Cache: " + JSON.stringify(this.cache_meta).length + ", Path Cache: " + JSON.stringify(this.cache_path).length);
        } else {
            this.cache_meta = { get: [], find: [] };
            this.cache_path = { get: [], find: [] };
        }

        setInterval(this.save_cache, 5*60*1000)
    }



    static save_cache() {
        let meta = JSON.stringify(Cache.cache_meta);
        let path = JSON.stringify(Cache.cache_path)
        fs.writeFileSync("./src/cache/cache_meta.json", meta);
        fs.writeFileSync("./src/cache/cache_path.json", path);
        console.log("Saved caches to file. Lengths of saved caches: Meta Cache: " + meta.length + ", Path Cache: " + path.length);
    }

    /**
     * 
     * @param {String} type Meta,Path
     * @param {String} request Find,Get
     * @param {String} name Name
     */
    static async get(type, request, name) {
        let cached = this.check_cache(type, request, name);
        if (cached) return cached.response;
        else {
            const url = this.url(type, request, name);
            const body = await this.request(url);

            if (type == "meta") {
                this.cache_meta[request].push({ name: name, response: body, added: Date.now() });
            } else if (type == "path") {
                this.cache_path[request].push({ name: name, response: body, added: Date.now() });
            }

            return body;
        }
    }

    /**
     * 
     * @param {String} type Meta,Path
     * @param {String} request Find,Get
     * @param {String} name Name
     */
    static async get_nocache(type, requst, name) {
        const url = this.url(type, request, name);
        const body = await this.request(url);
        if (type == "meta") {
            this.cache_meta[request].push({ name: name, response: body, added: Date.now() });
        } else if (type == "path") {
            this.cache_path[request].push({ name: name, response: body, added: Date.now() });
        }
        return body;
    }

    /**
     * 
     * @param {String} type Meta,Path
     * @param {String} request Find,Get
     * @param {String} name Name
     * @returns {String}
     */
    static url(type, request, name) {
        const BASE = "https://rest.kegg.jp/";
        var str = BASE + request + "/";

        if (request == "find") {
            str += type == "meta" ? "compound" : "pathway";
            str += "/";
        }

        str += name;

        return str;
    }

    /**
     * 
     * @param {String} type Meta,Path
     * @param {String} request Find,Get
     * @param {String} name Name
     */
    static check_cache(type, request, name) {
        if (type == "meta") {
            let cached = this.cache_meta[request].find(e => e.name == name);
            if (cached) return cached;
            else return false;
        }
        else if (type == "path") {
            let cached = this.cache_path[request].find(e => e.name == name);
            if (cached) return cached;
            else return false;
        }
    }

    static async request(url) {
        const response = await fetch(url);
        const body = await response.text();
        return body;
    }

    static log_caches() {
        console.log(this.cache_meta);
        console.log(this.cache_path);
    }
}

module.exports = Cache;