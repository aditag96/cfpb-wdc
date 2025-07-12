(function() {
  var myConnector = tableau.makeConnector();

  function fetchAPI(start, end, pageNum, pageSize) {
    var apiUrl = 'https://api.consumerfinance.gov/data/complaints/summaries.json' +
                 '?date_received_min=' + start +
                 '&date_received_max=' + end +
                 '&page[number]=' + pageNum +
                 '&page[size]='   + pageSize;
    var url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl);
    return fetch(url).then(function(resp) {
      if (!resp.ok) throw new Error('Proxy error: ' + resp.status);
      return resp.json();
    });
  }

  myConnector.getSchema = function(schemaCallback) {
    var cols = [
      { id: 'id',            alias: 'Complaint ID',  dataType: tableau.dataTypeEnum.int    },
      { id: 'date_received', alias: 'Date Received', dataType: tableau.dataTypeEnum.date   },
      { id: 'product',       alias: 'Product',       dataType: tableau.dataTypeEnum.string },
      { id: 'company',       alias: 'Company',       dataType: tableau.dataTypeEnum.string },
      { id: 'state',         alias: 'State',         dataType: tableau.dataTypeEnum.string }
    ];
    schemaCallback([{
      id: 'cfpbComplaints',
      alias: 'CFPB Complaints (Summaries via Proxy)',
      columns: cols
    }]);
  };

  myConnector.getData = function(table, doneCallback) {
    var parts    = tableau.connectionData.split(',');
    var start    = parts[0],
        end      = parts[1],
        pageSize = 500,
        pageNum  = 1;

    (function iterate() {
      fetchAPI(start, end, pageNum, pageSize)
        .then(function(json) {
          var data = json.data;
          if (!data || data.length === 0) {
            return doneCallback();
          }
          var rows = data.map(function(rec) {
            return {
              id:            parseInt(rec.id, 10),
              date_received: rec.attributes.date_received,
              product:       rec.attributes.product,
              company:       rec.attributes.company,
              state:         rec.attributes.state
            };
          });
          table.appendRows(rows);
          pageNum++;
          iterate();
        })
        .catch(function(err) {
          tableau.abortWithError(err.message);
        });
    })();
  };

  tableau.registerConnector(myConnector);

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('form').addEventListener('submit', function(evt) {
      evt.preventDefault();
      tableau.connectionData = [
        document.getElementById('start_date').value,
        document.getElementById('end_date').value
      ].join(',');
      tableau.connectionName = 'CFPB Complaints Summaries via Proxy';
      tableau.submit();
    });
  });
})();