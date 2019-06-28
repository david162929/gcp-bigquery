// 載入 GCP 認證設定
const gcp = require("../.credentials/gcp-bq.js");

// Imports the Google Cloud client library
const {BigQuery} = require("@google-cloud/bigquery");

// Creates a client
const bigQuery = new BigQuery({
    projectId: gcp.projectId,
    keyFilename: gcp.keyFilename
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

module.exports = {
    bigQueryClient: bigQuery,
    queryRes: queryRes
};
