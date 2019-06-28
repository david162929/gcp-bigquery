const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");


const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// static files
app.use("/static", express.static("public"));


// 載入 GCP 認證設定
const gcp = require("../.credentials/gcp-bq.js");

// Imports the Google Cloud client library
const {BigQuery} = require("@google-cloud/bigquery");

// Creates a client
const bigQuery = new BigQuery({
    projectId: gcp.projectId,
    keyFilename: gcp.keyFilename
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/html/index.html"));
});

app.get("/chicago-taxi-trips-detail/:year/:month", async (req, res) => {
    console.log(req.params.year);
    console.log(req.params.month);
    const regY = /^20(1[3-9]|2[0-9])$/;
    const regM = /^(0[1-9]|1[0-2])$/;

    if (req.params.year.length !== 4 || req.params.month.length !== 2) {
        res.send("輸入的格式有誤");
    } else if (!regY.test(req.params.year)) {
        res.send("請輸入正確年格式(2013~)");
    } else if (!regM.test(req.params.month)) {
        res.send("請輸入正確月格式");
    } else {
        // 啟動查詢
        const year = req.params.year;
        const month = req.params.month;

        const sqlQuery = `#standardSQL
        SELECT
            EXTRACT(HOUR FROM trip_start_timestamp) AS hour,
            FORMAT('%3.2f', AVG(trip_total)) AS avg_fare,
            FORMAT('%3.2f', AVG(tips)) AS avg_tip,  
            FORMAT("%3.2f", AVG(tips)/AVG(trip_total)) AS tip_fare_percent,
            COUNT(1) AS counts
        FROM
            \`bigquery-public-data.chicago_taxi_trips.taxi_trips\`
        WHERE
            CAST(trip_start_timestamp AS STRING) LIKE "${year}-${month}%"
        GROUP BY
            hour
        ORDER BY
            hour ASC`;

        const options = {
            query: sqlQuery,
            // Location must match that of the dataset(s) referenced in the query.
            location: "US"
        };
        const arrayRes = await queryRes(options);
        console.log(arrayRes);
        console.log(arrayRes.length);

        res.send(arrayRes);
    }
});


/**
 * BigQuery API
 * @param {Object} options query: 要執行的 query 語法, location: 地點
 * @return {Array} 回傳 query 的結果
 */
function queryRes(options) {
    return new Promise((reso, rej) => {
        // Run the query
        bigQuery.query(options)
            .then((arr) => {
                reso(arr[0]);
            })
            .catch((err) => {
                console.log(err);
                rej(err);
            });
    });
}

app.listen(3000, () => {
    console.log("running on port 3000.");
});
