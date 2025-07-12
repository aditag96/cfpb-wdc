(function() {
  var myConnector = tableau.makeConnector();

  function fetchAPI(start, end, pageNum, pageSize) {
    var url = 'https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/';
    var params = '?date_received_min=' + start +
                 '&date_received_max=' + end +
                 '&size=' + pageSize +
                 '&page=' + (pageNum-1);
    return fetch(url + params)
      .then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      });
  }

  myConnector.getSchema = function(schemaCallback) {
    var parts = tableau.connectionData.split(',');
    fetchAPI(parts[0], parts[1], 1, 1).then(function(json) {
      var first = json.hits.hits[0]._source;
      var cols = Object.keys(first).map(function(key) {
        var val = first[key];
        var dt = tableau.dataTypeEnum.string;
        if (typeof val === 'number') dt = tableau.dataTypeEnum.int;
        else if (/^\d{4}-\d{2}-\d{2}/.test(val)) dt = tableau.dataTypeEnum.date;
        return { id: key, alias: key, dataType: dt };
      });
      schemaCallback([{
        id: 'cfpbComplaints',
        alias: 'CFPB Complaints',
        columns: cols
      }]);
    }).catch(function(err) {
      tableau.abortWithError(err.message);
    });
  };

  myConnector.getData = function(table, doneCallback) {
    var parts = tableau.connectionData.split(',');
    var pageSize = 10000, pageNum = 1;
    (function iterate() {
      fetchAPI(parts[0], parts[1], pageNum++, pageSize)
        .then(function(json) {
          var hits = json.hits.hits;
          if (!hits.length) return doneCallback();
          table.appendRows(hits.map(r => r._source));
          iterate();
        })
        .catch(function(err) {
          tableau.abortWithError(err.message);
        });
    })();
  };

  // Only register *after* tableau.init() has been called in index.html
  tableau.registerConnector(myConnector);

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('form').addEventListener('submit', function(evt) {
      evt.preventDefault();
      var start = document.getElementById('start_date').value;
      var end   = document.getElementById('end_date').value;
      tableau.connectionData   = start + ',' + end;
      tableau.connectionName   = 'CFPB Complaints Full API';
      tableau.submit();
    });
  });
})();