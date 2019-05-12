const express = require('express');
let app = express();

// Metodo para econtrar o arquivo principal (index.html) na raiz
app.use(express.static(__dirname + '/'));

app.listen(process.env.PORT || 8088);
console.log("Servidor ok! Porta: 8088 \nPressione Ctrl + C para parar o servidor.");