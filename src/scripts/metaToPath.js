const fetch = require('node-fetch');
const Cache = require('./cache')

class MetaToPath {
    /**
    * 
    * @param {Array} input_arr 
    */
    static async create2DPathways(input_arr) {
        // input is an array of metabolites

        var metabs = [];

        for (let i = 0; i < input_arr.length; i++) {
            var metabolite = input_arr[i];
            if (!metabolite.startsWith("cpd:"))
                metabolite = "cpd:" + metabolite;

            const body = await Cache.get("meta", "get", metabolite);

            // extract pathways from body
            var lines = body.split("\n");
            var start_index = 0;
            var end_index = 0;

            for (let a = 0; a < lines.length; a++) {
                const line = lines[a];

                if (line.startsWith("PATH")) {
                    start_index = a;
                    continue;
                }

                if (start_index != 0 && !line.startsWith(" ")) {
                    end_index = a;
                    break;
                }
            }

            var pathways_arr = lines.splice(start_index, end_index - start_index);

            var pathways = pathways_arr.map(el => {
                return el.split("map")[1].split("  ")[1];
            })

            for (let i = 0; i < pathways.length; i++) {
                pathways[i] = pathways[i].replace(/\,/g, "|");
            }

            metabs.push({ input: metabolite, paths: pathways });
        }



        return metabs;
    }

    
    /**
     * 
     * @param {Array} metabs 
     */
    static toMatrix(metabs) {
        var pathways = [];

        for (let i = 0; i < metabs.length; i++) {
            const meta = metabs[i];
            meta.paths.forEach(path => {
                if (!pathways.includes(path))
                    pathways.push(path);
            });
        }


        // var result2D = Array.from(Array(metabs.length), () => new Array(pathways.length));
        var result2D = Array(metabs.length).fill(0).map(() => Array(pathways.length).fill(0));


        for (let i = 0; i < metabs.length; i++) {
            const meta = metabs[i];
            meta.paths.forEach(path => {
                result2D[i][pathways.indexOf(path)] = 1;
            })
        }

        return {result: result2D, paths: pathways};
    }

    static pathways(metabs) {
        var pathways = [];
        for (let i = 0; i < metabs.length; i++) {
            const meta = metabs[i];
            meta.paths.forEach(path => {
                path = path.replace(/\,/g, "|");
                if (!pathways.includes(path))
                    pathways.push(path);
            });
        }
        return pathways;
    }

    /**
     * 
     * @param {Array} metabs
     */
    static arrToCSV(metabs) {
        var paths = this.pathways(metabs);

        var str = "Name,";

        paths.forEach(path => {
            str += path + ",";
        })

        str = str.substring(0, str.length - 1);

        for (let i = 0; i < metabs.length; i++) {
            const meta = metabs[i];
            str += "\n" + meta.input + ",";

            paths.forEach(path => {
                if (meta.paths.includes(path)) {
                    str += "1";
                } else {
                    str += "0";
                }

                str += ","
            });

            str = str.substring(0, str.length - 1); 
        }

        return str;
    }
}

module.exports = MetaToPath;