const express = require('express');
const app = express();

const fs = require('fs');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

// var favicon = require('serve-favicon');
// app.use(favicon(__dirname + '/src/img/favicon.ico'));

// app.use('/favicon.ico', express.static('src/img/favicon.ico'));

const search = require('./src/scripts/hugoSearch');
const { response } = require('express');
var genes = [];

app.get("/logo", (req, res) => {
    res.sendFile(__dirname + "/src/img/favicon.png")
})

app.get("/", (request, response) => {
    response.redirect("Home");
})

app.get("/:redirect", (request, response) => {
    const path = __dirname + "/src/html/" + request.params.redirect + ".html";
    if (fs.existsSync(path))
        response.sendFile(path);
    else
        response.status(404).send("Not found.");
})

app.post("/submit_genes", jsonParser, (req, res) => {
    // --calculate genes--

    // get requested genes
    let req_genes = req.body.genes;
    // get requested type
    let req_type = req.body.type;

    if (req_type == "not-selected") {

        res.status(400).send("select-type");

        return;
    }

    // parse type
    let type = parseInt(req_type);

    if (type == NaN || type > 4) {
        res.status(400).send("bad-type");

        return;
    }

    // array of requested genes
    var requested = req_genes.split("\n");

    // found genes
    var found = [];

    for (let i = 0; i < requested.length; i++) {
        var gene = requested[i];
        gene = gene.trim();

        if (gene == "") {
            found.push("empty");
            continue;
        }
        
        
        const found_gene = genes.find(e => {
            for (let a = 0; a < e.length; a++) {
                if (e[a].split(",").includes(gene))
                    return true;

                if (e[a].split(" ").includes(gene))
                    return true;
                
                if (e[a] == gene)
                    return true;
            }

            return false;
        });

        if (found_gene == undefined) {
            found.push("not-found");
        } else {
            found.push(found_gene[type]);
        }
    }

    res.status = 200;
    res.send(JSON.stringify(found));
});

app.listen(5000, () => {
    console.log("Server started at port 5000");
    genes = search("./hugo.txt");
})