const express = require('express');
const app = express();
const port = 3110;
const router = express.Router();
var cors = require('cors');

app.use(cors());

app.use(express.static(`${__dirname}/dist`));

app.use('/', router);

router.get('*', (req, res, next) => {
  req.url = replaceEscapeCharacters(req.url);
  req.path = replaceEscapeCharacters(req.path);
  // use req.path, instead of req.url, to discard any query parameter (like webpack hashes)
  res.sendFile(`${__dirname}` + req.url);
});

const replaceEscapeCharacters = ( text ) => {
  text = text.replace( '%20', ' ' );
  if( text.includes('%20') )
    return replaceEscapeCharacters( text );
  else
    return text;
}

app.listen(port);
