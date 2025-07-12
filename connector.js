(function() {
  var myConnector = tableau.makeConnector();

  // Fetch one page of summary data
  function fetchAPI(start, end, pageNum, pageSize) {
    var url = 'https://api.consumerfinance.gov/data/complaints/summaries.json';
    var params = '?date_received_min=' + start +
                 '&date_received_max=' + end +
                 '&page[number]=' + pageNum +
                 '&page[size]='   + pageSize;
    return fetch(url + params)
      .then(function(resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      });
  }

  // Define schema based on the summary fields we want
  myConnector.getSchema = function(schemaCallback) {
    // Hardcode the columns we know are in the summary response
    var cols = [
      { id: 'id',               alias: 'Complaint ID',      dataType: tableau.dataTypeEnum.int },
      { id: 'date_received',    alias: 'Date Received',     dataType: tableau.dataTypeEnum.date },
      { id: 'product',          alias: 'Product',           dataType: tableau.dataTypeEnum.string },
      { id: 'company',          alias: 'Company',           dataType: tableau.dataTypeEnum.string },
      { id: 'state',            alias: 'State',             dataType: tableau.dataTypeEnum.string }
    ];
    var tableSchema = {
      id:      'cfpbComplaints',
      alias:   'CFPB Consumer Complaints (Summaries)',
      columns: cols
    };
    schemaCallback([tableSchema]);
  };

  // Page through and append rows from the summaries endpoint
  myConnector.getData = function(table, doneCallback) {
    var parts = tableau.connectionData.split(',');
    var start    = parts[0],
        end      = parts[1],
        pageSize = 500,
        pageNum  = 1;

    function iterate() {
      fetchAPI(start, end, pageNum, pageSize)
        .then(function(json) {
          var data = json.data;
          if (!data || data.length === 0) {
            doneCallback();
            return;
          }

          // Map each summary record into our cols
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
    }
    iterate();
  };

  tableau.registerConnector(myConnector);

  // Form submission wiring
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('form').addEventListener('submit', function(evt) {
      evt.preventDefault();
      var start = document.getElementById('start_date').value;
      var end   = document.getElementById('end_date').value;
      tableau.connectionData = start + ',' + end;
      tableau.connectionName = 'CFPB Complaints Summaries API';
      tableau.submit();
    });
  });
})();