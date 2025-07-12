```js
(function() {
  var myConnector = tableau.makeConnector();

  function fetchAPI(start, end, pageNum, pageSize) {
    var url = 'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/';
    var params = '?date_received_min=' + start +
                 '&date_received_max=' + end +
                 '&size=' + pageSize +
                 '&page=' + (pageNum-1);
    return fetch(url + params).then(function(resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    });
  }

  myConnector.getSchema = function(schemaCallback) {
    var [start, end] = tableau.connectionData.split(',');
    fetchAPI(start, end, 1, 1)
      .then(json => {
        var first = json.hits.hits[0]._source;
        var cols = Object.keys(first).map(key => ({
          id: key,
          alias: key,
          dataType: typeof first[key] === 'number'
            ? tableau.dataTypeEnum.int
            : /^\d{4}-\d{2}-\d{2}/.test(first[key])
              ? tableau.dataTypeEnum.date
              : tableau.dataTypeEnum.string
        }));
        schemaCallback([{ id: 'cfpbComplaints', alias: 'CFPB Complaints', columns: cols }]);
      })
      .catch(err => tableau.abortWithError(err.message));
  };

  myConnector.getData = function(table, doneCallback) {
    var [start, end] = tableau.connectionData.split(',');
    var pageSize = 10000, pageNum = 1;
    function iterate() {
      fetchAPI(start, end, pageNum++, pageSize)
        .then(json => {
          var hits = json.hits.hits;
          if (!hits.length) return doneCallback();
          table.appendRows(hits.map(r => r._source));
          iterate();
        })
        .catch(err => tableau.abortWithError(err.message));
    }
    iterate();
  };

  tableau.registerConnector(myConnector);
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form').addEventListener('submit', evt => {
      evt.preventDefault();
      tableau.connectionData = [
        document.getElementById('start_date').value,
        document.getElementById('end_date').value
      ].join(',');
      tableau.connectionName = 'CFPB Complaints Full API';
      tableau.submit();
    });
  });
})();
```