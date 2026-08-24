const fs = require('fs');
fetch('https://dapo.kemendikdasmen.go.id/pencarian?q=SMK%20Negeri%201%20Jakarta')
  .then(res => res.text())
  .then(text => fs.writeFileSync('dapodik_search.html', text));
